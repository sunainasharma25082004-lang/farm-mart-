import AppUser from "../models/AppUser.js";

export const seedPartner = async () => {
  const appId = "PARTNER-DEV-2409";
  const password = "Sfarmart@2409";

  try {
    const existing = await AppUser.findOne({ appId });
    if (!existing) {
      await AppUser.create({
        appId,
        password,
        role: "PARTNER",
        name: "sfarmart Development Partner",
        phone: "9999902409",
        isActive: true,
      });
      console.log(`Partner account seeded: ${appId}`);
    }
  } catch (error) {
    console.warn("Partner seed error:", error.message);
  }
};

export const seedDelivery = async () => {
  const appId = "DELIVERY-DEV-2409";
  const password = "Sfarmart@2409";

  try {
    const existing = await AppUser.findOne({ appId });
    if (!existing) {
      await AppUser.create({
        appId,
        password,
        role: "DELIVERY",
        name: "sfarmart Development Rider",
        phone: "9999902410",
        isActive: true,
      });
      console.log(`Delivery account seeded: ${appId}`);
    }
  } catch (error) {
    console.warn("Delivery seed error:", error.message);
  }
};

export const appLogin = async (req, res) => {
  try {
    const { appId, password, expectedRole } = req.body;

    // Find the user by appId
    const user = await AppUser.findOne({ appId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid ID or Password" });
    }

    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid ID or Password" });
    }

    if (user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role ${expectedRole}`,
      });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Account is suspended" });
    }

    // In a real app, generate a JWT here. For now, returning the user object.
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        appId: user.appId,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
