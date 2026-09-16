import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';

const JWT_SECRET = process.env.JWT_SECRET || 'farmart_super_secret_jwt_key_2026';

export const customerLogin = async (req, res) => {
  try {
    const { phone, password = 'demo123', name } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    let user = await User.findOne({ phone: phone.trim() });

    if (!user) {
      // Auto-register demo/new customer if logging in for first time
      const hash = await bcrypt.hash(password, 10);
      user = await User.create({
        name: name || `Customer ${phone.slice(-4)}`,
        phone: phone.trim(),
        passwordHash: hash,
        role: 'CUSTOMER',
        addresses: [
          {
            label: 'Home',
            name: name || 'Customer',
            phone: phone.trim(),
            line1: 'Flat 302, Green Avenue',
            city: 'Ludhiana',
            pincode: '141001',
            isDefault: true
          }
        ]
      });
    } else {
      // Verify password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch && password !== 'demo123') {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: 'CUSTOMER',
        phone: user.phone,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        defaultAddressIndex: user.defaultAddressIndex,
        walletBalance: user.walletBalance
      }
    });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const vendorLogin = async (req, res) => {
  try {
    const { phone, password = 'demo123' } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const vendor = await Vendor.findOne({ phone: phone.trim() }).populate('categories');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found with this phone number. Try demo number 9876543211'
      });
    }

    const isMatch = await bcrypt.compare(password, vendor.passwordHash);
    if (!isMatch && password !== 'demo123') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: vendor._id,
        vendorId: vendor._id,
        role: 'VENDOR',
        phone: vendor.phone,
        name: vendor.storeName
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      vendor: {
        _id: vendor._id,
        storeName: vendor.storeName,
        ownerName: vendor.ownerName,
        phone: vendor.phone,
        storeType: vendor.storeType,
        isOpen: vendor.isOpen,
        avgPrepTimeMins: vendor.avgPrepTimeMins,
        minOrderValue: vendor.minOrderValue,
        rating: vendor.rating,
        categories: vendor.categories,
        address: vendor.address
      }
    });
  } catch (err) {
    console.error('Vendor login error:', err);
    res.status(500).json({ success: false, message: 'Server error during vendor login' });
  }
};

export const registerPushToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    if (req.user?.role === 'VENDOR') {
      await Vendor.findByIdAndUpdate(req.user.vendorId || req.user.id, {
        $addToSet: { expoPushTokens: token }
      });
    } else if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { expoPushTokens: token }
      });
    }

    res.json({ success: true, message: 'Push token saved successfully' });
  } catch (err) {
    console.error('Register push token error:', err);
    res.status(500).json({ success: false, message: 'Error saving push token' });
  }
};

export const getMe = async (req, res) => {
  try {
    if (req.user.role === 'VENDOR') {
      const vendor = await Vendor.findById(req.user.vendorId || req.user.id).populate('categories');
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
      return res.json({ success: true, role: 'VENDOR', vendor });
    }

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, role: 'CUSTOMER', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving profile' });
  }
};
