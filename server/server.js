import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// In-memory data store for partner applications & inquiries
const applications = [];
const contactInquiries = [];
const users = []; // In-memory users store
const jobApplications = []; // In-memory job applications store

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Farmart Agri-Tech Backend API Operational', timestamp: new Date() });
});

// Submit Partner Application API
app.post('/api/apply', (req, res) => {
  const { categoryId, fullName, phone, email, state, district, experience, notes } = req.body;

  if (!fullName || !phone || !state || !district) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
  }

  const newApp = {
    id: `FMT-APP-${Date.now()}`,
    categoryId,
    fullName,
    phone,
    email,
    state,
    district,
    experience,
    notes,
    status: 'RECEIVED',
    createdAt: new Date()
  };

  applications.push(newApp);
  console.log('New Application Received:', newApp);

  res.status(201).json({
    success: true,
    message: 'Application received successfully!',
    applicationId: newApp.id
  });
});

// Submit General Contact Inquiry API
app.post('/api/contact', (req, res) => {
  const { name, phone, email, inquiryType, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Please complete all required fields.' });
  }

  const newInquiry = {
    id: `FMT-MSG-${Date.now()}`,
    name,
    phone,
    email,
    inquiryType,
    message,
    createdAt: new Date()
  };

  contactInquiries.push(newInquiry);
  console.log('New Contact Inquiry Received:', newInquiry);

  res.status(201).json({
    success: true,
    message: 'Inquiry received successfully!',
    inquiryId: newInquiry.id
  });
});

// Submit Job Application API
app.post('/api/apply-job', (req, res) => {
  const { jobId, jobTitle, fullName, email, phone, location, experience, qualification, notes, resumeName } = req.body;

  if (!fullName || !phone || !experience || !location) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
  }

  const newJobApp = {
    id: `FMT-JOB-${Date.now()}`,
    jobId,
    jobTitle,
    fullName,
    email,
    phone,
    location,
    experience,
    qualification,
    notes,
    resumeName: resumeName || 'Not uploaded',
    status: 'RECEIVED',
    appliedAt: new Date()
  };

  jobApplications.push(newJobApp);
  console.log(`New Job Application Received for ${jobTitle}:`, newJobApp.fullName);

  res.status(201).json({
    success: true,
    message: 'Job application received successfully!',
    applicationId: newJobApp.id
  });
});

// Create Razorpay Order API
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = `receipt_${Date.now()}` } = req.body;
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt,
    };
    
    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error });
  }
});

// Verify Razorpay Payment API
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Payment is successful
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature, payment failed' });
  }
});

// User Registration API
app.post('/api/register', (req, res) => {
  const { name, phone, password, city } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }
  
  const existingUser = users.find(u => u.phone === phone);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Phone number already registered' });
  }

  const newUser = {
    id: `USER-${Date.now()}`,
    name,
    phone,
    password, // In a real app, hash this using bcrypt!
    city: city || 'Ludhiana',
    district: 'Ludhiana',
    villageHub: 'Village Hub - Rural',
    referralCode: `FMT-${name.substring(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
    referralEarnings: 0
  };

  users.push(newUser);
  console.log('New User Registered:', newUser.phone);
  
  res.status(201).json({ success: true, message: 'Registration successful', user: newUser });
});

// User Login API
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  
  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone and password required' });
  }

  const user = users.find(u => u.phone === phone && u.password === password);
  
  if (user) {
    // In a real app, return a JWT token here
    res.json({ success: true, message: 'Login successful', user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid phone or password' });
  }
});

// --- Admin Endpoints ---

// Get all data for Admin Dashboard
app.get('/api/admin/data', (req, res) => {
  res.json({
    success: true,
    data: {
      applications,
      jobApplications,
      users,
      contactInquiries
    }
  });
});

// Update Application Status
app.post('/api/admin/update-status', (req, res) => {
  const { id, type, status } = req.body;
  
  if (!id || !type || !status) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  let found = false;
  if (type === 'partner') {
    const idx = applications.findIndex(a => a.id === id);
    if (idx !== -1) {
      applications[idx].status = status;
      found = true;
    }
  } else if (type === 'job') {
    const idx = jobApplications.findIndex(j => j.id === id);
    if (idx !== -1) {
      jobApplications[idx].status = status;
      found = true;
    }
  }

  if (found) {
    res.json({ success: true, message: `Status updated to ${status}` });
  } else {
    res.status(404).json({ success: false, message: 'Record not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🌾 Farmart MERN Backend Server running on http://localhost:${PORT}`);
});
