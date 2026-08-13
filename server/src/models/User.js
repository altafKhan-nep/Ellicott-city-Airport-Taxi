import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['passenger', 'driver', 'admin'], default: 'passenger' },
    avatar: { type: String, default: '' },
    driverDetails: {
      vehicleType: { type: String, enum: ['sedan', 'suv', 'van'], default: 'sedan' },
      plateNumber: { type: String, default: '' },
      licenseNo: { type: String, default: '' },
      isAvailable: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }).select('+password');
};

const User = mongoose.model('User', userSchema);
export default User;