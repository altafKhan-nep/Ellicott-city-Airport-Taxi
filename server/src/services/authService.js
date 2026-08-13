import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signAccess = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  });

const signRefresh = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  });

export const issueTokens = (user) => ({
  accessToken: signAccess(user),
  refreshToken: signRefresh(user),
});

export const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  driverDetails: user.driverDetails,
});

export const register = async ({ name, email, phone, password, role, driverDetails }) => {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

  const user = await User.create({ name, email, phone, password, role, driverDetails });
  return { user: publicUser(user), tokens: issueTokens(user) };
};

export const login = async ({ email, password }) => {
  const user = await User.findByEmail(email);
  if (!user || !(await user.matchPassword(password))) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }
  return { user: publicUser(user), tokens: issueTokens(user) };
};

export const refresh = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    return issueTokens(user);
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
  }
};