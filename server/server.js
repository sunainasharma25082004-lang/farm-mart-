import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// In-memory data store for partner applications & inquiries
const applications = [];
const contactInquiries = [];

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

app.listen(PORT, () => {
  console.log(`🌾 Farmart MERN Backend Server running on http://localhost:${PORT}`);
});
