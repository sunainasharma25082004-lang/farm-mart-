import mongoose from 'mongoose';

const appUserSchema = new mongoose.Schema({
  appId: { type: String, required: true, unique: true }, // e.g. PRT-1234 or RDR-5678
  password: { type: String, required: true },
  role: { type: String, enum: ['PARTNER', 'DELIVERY'], required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const AppUser = mongoose.model('AppUser', appUserSchema);
export default AppUser;
