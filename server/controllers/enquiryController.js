import Enquiry from '../models/Enquiry.js';
import AppUser from '../models/AppUser.js';

// Generate a random alphanumeric string of a given length
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Website submits an enquiry
export const submitEnquiry = async (req, res) => {
  try {
    const { name, phone, email, role, details } = req.body;
    const newEnquiry = new Enquiry({ name, phone, email, role, details });
    await newEnquiry.save();
    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', enquiry: newEnquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin fetches all enquiries
export const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin approves an enquiry and generates credentials
export const approveEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id);
    
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    
    if (enquiry.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Already approved' });
    }

    // Generate ID based on Role
    const prefix = enquiry.role === 'PARTNER' ? 'PRT-' : 'RDR-';
    const uniqueId = prefix + Math.floor(1000 + Math.random() * 9000);
    const password = generateRandomString(8); // 8 character random password

    // Save to AppUser
    const newUser = new AppUser({
      appId: uniqueId,
      password,
      role: enquiry.role,
      name: enquiry.name,
      phone: enquiry.phone
    });
    
    await newUser.save();

    // Update Enquiry
    enquiry.status = 'APPROVED';
    enquiry.generatedId = uniqueId;
    enquiry.generatedPassword = password;
    enquiry.updatedAt = Date.now();
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Enquiry approved and credentials generated',
      credentials: { id: uniqueId, password },
      enquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
