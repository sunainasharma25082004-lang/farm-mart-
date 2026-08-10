import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const memoryUsers = [];

export const registerUser = async (req, res) => {
  const { name, phone, password, city } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      id: `USER-${Date.now()}`,
      name,
      phone,
      password: hashedPassword,
      city: city || 'Ludhiana',
      district: 'Ludhiana',
      villageHub: 'Village Hub - Rural',
      referralCode: `FMT-${name.substring(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
      referralEarnings: 0
    };

    const newUser = await User.create(userData);
    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, message: 'Registration successful', user: userObj });
  } catch (error) {
    // Memory Fallback
    const existingMem = memoryUsers.find(u => u.phone === phone);
    if (existingMem) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      id: `USER-${Date.now()}`,
      name,
      phone,
      password: hashedPassword,
      city: city || 'Ludhiana',
      district: 'Ludhiana',
      villageHub: 'Village Hub - Rural',
      referralCode: `FMT-${name.substring(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
      referralEarnings: 0
    };
    memoryUsers.push(userData);
    const { password: _, ...userWithoutPass } = userData;
    res.status(201).json({ success: true, message: 'Registration successful', user: userWithoutPass });
  }
};

export const loginUser = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone and password required' });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const userObj = user.toObject();
      delete userObj.password;
      res.json({ success: true, message: 'Login successful', user: userObj });
    } else {
      res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
  } catch (error) {
    const memUser = memoryUsers.find(u => u.phone === phone);
    if (memUser && (await bcrypt.compare(password, memUser.password).catch(() => false))) {
      const { password: _, ...uObj } = memUser;
      return res.json({ success: true, message: 'Login successful', user: uObj });
    }
    res.status(401).json({ success: false, message: 'Invalid phone or password' });
  }
};

export const getMemoryUsers = () => memoryUsers;
