import Admin from '../models/Admin.js';
import Application from '../models/Application.js';
import JobApplication from '../models/Job.js';
import User from '../models/User.js';
import ContactInquiry from '../models/Contact.js';
import bcrypt from 'bcryptjs';

import { getMemoryApplications } from './applicationController.js';
import { getMemoryInquiries } from './contactController.js';
import { getMemoryJobs } from './jobController.js';
import { getMemoryUsers } from './userController.js';

const memoryAdmins = [
  {
    id: 'super-admin-01',
    username: 'superadmin',
    password: 'superadmin123',
    role: 'superadmin',
    name: 'Super Admin',
    access: ['users', 'partners', 'riders', 'jobs']
  }
];

export const seedAdmin = async () => {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      await Admin.create({
        id: 'super-admin-01',
        username: 'superadmin',
        password: hashedPassword,
        role: 'superadmin',
        name: 'Super Admin',
        access: ['users', 'partners', 'riders', 'jobs']
      });
      console.log('👑 Default SuperAdmin seeded into Database');
    }
  } catch (err) {
    console.warn('Admin seed error:', err.message);
  }
};

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  try {
    const adminUser = await Admin.findOne({ username });
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (isMatch) {
      const adminObj = adminUser.toObject();
      delete adminObj.password;
      return res.json({ success: true, message: 'Admin login successful', admin: adminObj });
    }
  } catch (error) {
    const memAdmin = memoryAdmins.find(a => a.username === username);
    if (memAdmin && (memAdmin.password === password || (await bcrypt.compare(password, memAdmin.password).catch(() => false)))) {
      const { password: _, ...adminData } = memAdmin;
      return res.json({ success: true, message: 'Admin login successful', admin: adminData });
    }
  }

  res.status(401).json({ success: false, message: 'Invalid admin credentials' });
};

export const createSubAdmin = async (req, res) => {
  const { username, password, name, access } = req.body;
  if (!username || !password || !name || !access) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const exists = await Admin.findOne({ username });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      id: `subadmin-${Date.now()}`,
      username,
      password: hashedPassword,
      role: 'subadmin',
      name,
      access
    });

    const adminObj = newAdmin.toObject();
    delete adminObj.password;
    res.status(201).json({ success: true, message: 'Sub Admin created successfully', admin: adminObj });
  } catch (error) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = {
      id: `subadmin-${Date.now()}`,
      username,
      password: hashedPassword,
      role: 'subadmin',
      name,
      access
    };
    memoryAdmins.push(newAdmin);
    const { password: _, ...adminData } = newAdmin;
    res.status(201).json({ success: true, message: 'Sub Admin created successfully', admin: adminData });
  }
};

export const getAdminData = async (req, res) => {
  try {
    const [applications, jobApplications, users, contactInquiries] = await Promise.all([
      Application.find().sort({ createdAt: -1 }),
      JobApplication.find().sort({ appliedAt: -1 }),
      User.find({}, '-password').sort({ _id: -1 }),
      ContactInquiry.find().sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        applications: applications.length > 0 ? applications : getMemoryApplications().reverse(),
        jobApplications: jobApplications.length > 0 ? jobApplications : getMemoryJobs().reverse(),
        users: users.length > 0 ? users : getMemoryUsers().map(({ password, ...u }) => u).reverse(),
        contactInquiries: contactInquiries.length > 0 ? contactInquiries : getMemoryInquiries().reverse()
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        applications: getMemoryApplications().reverse(),
        jobApplications: getMemoryJobs().reverse(),
        users: getMemoryUsers().map(({ password, ...u }) => u).reverse(),
        contactInquiries: getMemoryInquiries().reverse()
      }
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { id, type, status } = req.body;
  if (!id || !type || !status) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  try {
    let updated = false;
    if (type === 'partner') {
      const resObj = await Application.findOneAndUpdate({ id }, { status });
      if (resObj) updated = true;
    } else if (type === 'job') {
      const resObj = await JobApplication.findOneAndUpdate({ id }, { status });
      if (resObj) updated = true;
    }

    if (updated) {
      return res.json({ success: true, message: `Status updated to ${status}` });
    }
  } catch (error) {
    // fallback
  }

  // memory fallback update
  const memApps = getMemoryApplications();
  const memJobs = getMemoryJobs();
  let found = false;

  if (type === 'partner') {
    const idx = memApps.findIndex(a => a.id === id);
    if (idx !== -1) {
      memApps[idx].status = status;
      found = true;
    }
  } else if (type === 'job') {
    const idx = memJobs.findIndex(j => j.id === id);
    if (idx !== -1) {
      memJobs[idx].status = status;
      found = true;
    }
  }

  if (found) {
    res.json({ success: true, message: `Status updated to ${status}` });
  } else {
    res.status(404).json({ success: false, message: 'Record not found' });
  }
};
