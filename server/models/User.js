import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: String,
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: String,
  district: String,
  villageHub: String,
  referralCode: String,
  referralEarnings: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);
export default User;
