import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: '',
      trim: true
    },
    addresses: [
      {
        label: { type: String, default: 'Home' },
        name: String,
        phone: String,
        line1: { type: String, required: true },
        city: { type: String, default: 'Ludhiana' },
        state: { type: String, default: 'Punjab' },
        pincode: { type: String, default: '141001' },
        isDefault: { type: Boolean, default: false }
      }
    ],
    defaultAddressIndex: {
      type: Number,
      default: 0
    },
    walletBalance: {
      type: Number,
      default: 250
    },
    expoPushTokens: [
      {
        type: String
      }
    ],
    role: {
      type: String,
      enum: ['CUSTOMER', 'VENDOR', 'RIDER', 'ADMIN'],
      default: 'CUSTOMER'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
