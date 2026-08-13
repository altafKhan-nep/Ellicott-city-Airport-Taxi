import { asyncHandler } from '../middleware/error.js';
import * as authService from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);
  res.status(201).json({ user, tokens });
});

export const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login(req.body);
  res.json({ user, tokens });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });
  const tokens = await authService.refresh(refreshToken);
  res.json({ tokens });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: authService.publicUser(req.user) });
});