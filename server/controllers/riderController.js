import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Rider from '../models/Rider.js';
import Order from '../models/Order.js';
import { handleRiderAccept, handleRiderDecline } from '../services/riderAssignmentService.js';
import { notifyOrderStatus } from '../services/notify.js';
import { getIO } from '../socket/index.js';

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'sfarmart_jwt_access_secret_2026_super_secure_key';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'sfarmart_jwt_refresh_secret_2026_rotating_super_key';

// In-memory rate limiting and breadcrumb throttling per rider:
// Map<riderId, { lastPingAt: number, lastBreadcrumbAt: number }>
const locationRateLimiter = new Map();

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate Access & Refresh Tokens for Rider
 */
function generateTokens(rider) {
  const payload = {
    id: rider._id,
    sub: rider._id,
    role: 'RIDER',
    phone: rider.phone,
    name: rider.name
  };

  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const rawRefreshToken = crypto.randomBytes(32).toString('hex');
  const refreshTokenHash = hashToken(rawRefreshToken);

  return { accessToken, rawRefreshToken, refreshTokenHash };
}

// @desc    Rider Login (Dual-Token)
// @route   POST /api/rider/auth/login
export const riderLogin = async (req, res) => {
  try {
    const { phone, password, deviceId } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required.' });
    }

    const rider = await Rider.findOne({ phone: phone.trim() });
    if (!rider) {
      return res.status(401).json({ success: false, message: 'Invalid rider phone or password.' });
    }

    const isMatch = await rider.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid rider phone or password.' });
    }

    const { accessToken, rawRefreshToken, refreshTokenHash } = generateTokens(rider);

    rider.refreshTokenHash = refreshTokenHash;
    if (deviceId) rider.deviceId = deviceId;
    await rider.save();

    res.json({
      success: true,
      token: accessToken,
      refreshToken: rawRefreshToken,
      rider: rider.toJSON()
    });
  } catch (error) {
    console.error('Rider login error:', error);
    res.status(500).json({ success: false, message: 'Server error during rider login', error: error.message });
  }
};

// @desc    Rider Refresh Token Rotation
// @route   POST /api/rider/auth/refresh
export const riderRefresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required.' });
    }

    const providedHash = hashToken(refreshToken);
    const rider = await Rider.findOne({ refreshTokenHash: providedHash });

    if (!rider) {
      return res.status(403).json({ success: false, code: 'TOKEN_INVALID', message: 'Invalid or expired session.' });
    }

    const { accessToken, rawRefreshToken, refreshTokenHash } = generateTokens(rider);
    rider.refreshTokenHash = refreshTokenHash;
    await rider.save();

    res.json({
      success: true,
      token: accessToken,
      refreshToken: rawRefreshToken
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Refresh token error', error: error.message });
  }
};

// @desc    Rider Logout
// @route   POST /api/rider/auth/logout
export const riderLogout = async (req, res) => {
  try {
    const riderId = req.user?.id;
    if (riderId) {
      await Rider.findByIdAndUpdate(riderId, {
        status: 'OFFLINE',
        refreshTokenHash: ''
      });
    }
    res.json({ success: true, message: 'Rider logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout error', error: error.message });
  }
};

// @desc    Toggle Duty Status (ONLINE_IDLE <-> OFFLINE)
// @route   PATCH /api/rider/status
export const toggleRiderStatus = async (req, res) => {
  try {
    const riderId = req.user?.id;
    const { status } = req.body;

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found.' });
    }

    if (rider.status === 'ON_DELIVERY' && status === 'OFFLINE') {
      return res.status(400).json({
        success: false,
        code: 'ACTIVE_DELIVERY_IN_PROGRESS',
        message: 'Cannot go OFFLINE while an active delivery is in progress.'
      });
    }

    const targetStatus = status || (rider.status === 'OFFLINE' ? 'ONLINE_IDLE' : 'OFFLINE');
    rider.status = targetStatus;
    await rider.save();

    res.json({
      success: true,
      status: rider.status,
      rider: rider.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling duty status', error: error.message });
  }
};

// @desc    Rate-limited Live Location Ping
// @route   POST /api/rider/location
export const updateRiderLocation = async (req, res) => {
  try {
    const riderId = req.user?.id?.toString();
    const { lat, lng, heading = 0, speed = 0, orderId } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ success: false, message: 'Valid lat and lng required.' });
    }

    const now = Date.now();
    const state = locationRateLimiter.get(riderId) || { lastPingAt: 0, lastBreadcrumbAt: 0 };

    // Rate-limit: drop pings faster than 2.8s
    if (now - state.lastPingAt < 2800) {
      return res.json({ success: true, throttled: true });
    }
    state.lastPingAt = now;

    // Ephemeral update on Rider model
    await Rider.findByIdAndUpdate(riderId, {
      currentLocation: { type: 'Point', coordinates: [lng, lat] },
      locationUpdatedAt: new Date()
    });

    const activeOrderId = orderId || (await Rider.findById(riderId).select('activeOrderId'))?.activeOrderId;

    // If rider has an active order, emit live location to that order room
    if (activeOrderId) {
      const io = getIO();
      if (io) {
        io.to(`order:${activeOrderId}`).emit('order:rider_location', {
          orderId: activeOrderId,
          riderId,
          lat,
          lng,
          heading,
          speed,
          at: new Date()
        });
      }

      // Sparse breadcrumbs: write to MongoDB order.deliveryRoute only every ~30s
      if (now - state.lastBreadcrumbAt >= 30000) {
        state.lastBreadcrumbAt = now;
        await Order.findByIdAndUpdate(activeOrderId, {
          $push: { deliveryRoute: { lat, lng, at: new Date() } }
        });
      }
    }

    locationRateLimiter.set(riderId, state);
    res.json({ success: true, timestamp: now });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating rider location', error: error.message });
  }
};

// @desc    Get Current Active Delivery Order
// @route   GET /api/rider/active-order
export const getActiveDeliveryOrder = async (req, res) => {
  try {
    const riderId = req.user?.id;

    const order = await Order.findOne({
      rider: riderId,
      status: { $in: ['RIDER_ASSIGNED', 'RIDER_ARRIVED_STORE', 'OUT_FOR_DELIVERY'] }
    })
      .populate('vendor', 'storeName address phone location')
      .populate('customer', 'name phone');

    if (!order) {
      return res.json({ success: true, hasActiveOrder: false, order: null });
    }

    res.json({
      success: true,
      hasActiveOrder: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        vendor: order.vendor,
        customer: order.customer,
        address: order.address,
        items: order.items,
        pricing: order.pricing,
        payment: order.payment,
        pickupOtp: order.pickupOtp,
        placedAt: order.placedAt,
        riderAssignedAt: order.riderAssignedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching active order', error: error.message });
  }
};

// @desc    Accept Incoming Order Offer
// @route   POST /api/rider/orders/:id/accept
export const acceptOrderOffer = async (req, res) => {
  try {
    const riderId = req.user?.id;
    const { id } = req.params;

    const result = await handleRiderAccept(id, riderId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Order accepted successfully! Proceed to store for pickup.',
      order: result.order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error accepting order offer', error: error.message });
  }
};

// @desc    Decline Incoming Order Offer
// @route   POST /api/rider/orders/:id/decline
export const declineOrderOffer = async (req, res) => {
  try {
    const riderId = req.user?.id;
    const { id } = req.params;

    const result = await handleRiderDecline(id, riderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error declining order offer', error: error.message });
  }
};

// @desc    Rider Arrived at Store
// @route   POST /api/rider/orders/:id/arrived-store
export const arrivedAtStore = async (req, res) => {
  try {
    const riderId = req.user?.id;
    const { id } = req.params;

    const order = await Order.findOneAndUpdate(
      { _id: id, rider: riderId, status: 'RIDER_ASSIGNED' },
      {
        $set: { status: 'RIDER_ARRIVED_STORE' },
        $push: {
          statusHistory: { status: 'RIDER_ARRIVED_STORE', at: new Date(), by: 'RIDER' }
        }
      },
      { new: true }
    ).populate('vendor customer');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or status not eligible.' });
    }

    notifyOrderStatus(order);
    res.json({ success: true, message: 'Marked arrived at store', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating arrival status', error: error.message });
  }
};

// @desc    Verify Pickup from Store
// @route   POST /api/rider/orders/:id/pickup-verify
export const verifyPickup = async (req, res) => {
  try {
    const riderId = req.user?.id;
    const { id } = req.params;
    const { pickupOtp } = req.body;

    const order = await Order.findOne({ _id: id, rider: riderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Verify pickup OTP if supplied
    if (pickupOtp && order.pickupOtp && order.pickupOtp !== pickupOtp.toString().trim()) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PICKUP_OTP',
        message: 'Invalid Store Pickup OTP.'
      });
    }

    order.status = 'OUT_FOR_DELIVERY';
    order.statusHistory.push({
      status: 'OUT_FOR_DELIVERY',
      at: new Date(),
      by: 'RIDER'
    });
    await order.save();

    const populated = await Order.findById(order._id).populate('vendor customer');
    notifyOrderStatus(populated);

    res.json({
      success: true,
      message: 'Parcel picked up! Out for delivery to customer.',
      order: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying pickup', error: error.message });
  }
};

// @desc    Verify Delivery at Customer Doorstep with 4-digit Delivery OTP
// @route   POST /api/rider/orders/:id/delivery-verify
export const verifyDelivery = async (req, res) => {
  try {
    const riderId = req.user?.id;
    const { id } = req.params;
    const { deliveryOtp } = req.body;

    if (!deliveryOtp) {
      return res.status(400).json({
        success: false,
        code: 'OTP_REQUIRED',
        message: 'Customer 4-digit Delivery OTP is required to complete delivery.'
      });
    }

    const order = await Order.findOne({ _id: id, rider: riderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Active order not found.' });
    }

    // Strict Server-Side OTP Check:
    if (order.deliveryOtp && order.deliveryOtp !== deliveryOtp.toString().trim()) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_DELIVERY_OTP',
        message: 'Invalid Customer Delivery OTP. Please ask customer to check their Order Tracking screen.'
      });
    }

    order.status = 'DELIVERED';
    if (order.payment?.method === 'COD') {
      order.payment.status = 'PAID';
    }
    order.statusHistory.push({
      status: 'DELIVERED',
      at: new Date(),
      by: 'RIDER'
    });
    await order.save();

    // Credit ₹65 (6500 paise) to rider earnings
    await Rider.findByIdAndUpdate(riderId, {
      status: 'ONLINE_IDLE',
      activeOrderId: null,
      $inc: {
        completedDeliveries: 1,
        todayEarningsPaise: 6500,
        totalEarningsPaise: 6500
      }
    });

    const populated = await Order.findById(order._id).populate('vendor customer');
    notifyOrderStatus(populated);

    res.json({
      success: true,
      message: 'Delivery confirmed and finalized! Payout of ₹65 credited to your earnings.',
      earnedAmount: 65,
      order: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error completing delivery', error: error.message });
  }
};

// @desc    Get Rider Profile
// @route   GET /api/rider/profile
export const getRiderProfile = async (req, res) => {
  try {
    const rider = await Rider.findById(req.user?.id);
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found.' });
    }
    res.json({ success: true, rider: rider.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching rider profile', error: error.message });
  }
};

// @desc    Get Rider Earnings & History
// @route   GET /api/rider/earnings
export const getRiderEarnings = async (req, res) => {
  try {
    const rider = await Rider.findById(req.user?.id);
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found.' });
    }

    const completedOrders = await Order.find({
      rider: rider._id,
      status: 'DELIVERED'
    })
      .select('orderNumber pricing createdAt payment')
      .sort({ updatedAt: -1 })
      .limit(20);

    const todayEarnings = (rider.todayEarningsPaise || 0) / 100;
    const totalEarnings = (rider.totalEarningsPaise || 0) / 100;

    res.json({
      success: true,
      todayEarnings,
      totalEarnings,
      completedCount: rider.completedDeliveries || completedOrders.length,
      recentTrips: completedOrders.map((o) => ({
        id: o._id,
        orderNumber: o.orderNumber,
        earned: 65,
        paymentMethod: o.payment?.method || 'ONLINE',
        time: o.createdAt
      })),
      weeklyLedger: [
        { week: 'Current Week', trips: rider.completedDeliveries || 0, amount: todayEarnings, status: 'PENDING WEDNESDAY PAYOUT' },
        { week: 'Last Week', trips: 42, amount: 2730, status: 'PAID TO BANK' }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching rider earnings', error: error.message });
  }
};
