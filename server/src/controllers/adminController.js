import { asyncHandler } from '../middleware/error.js';
import Ride from '../models/Ride.js';
import User from '../models/User.js';

// GET /api/admin/analytics
export const analytics = asyncHandler(async (req, res) => {
  const [totalRides, activeRides, totalDrivers, totalPassengers, revenue, recentRides] =
    await Promise.all([
      Ride.countDocuments(),
      Ride.countDocuments({ status: { $in: ['pending', 'accepted', 'arriving', 'in_progress'] } }),
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'passenger' }),
      Ride.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fare.final' } } },
      ]),
      Ride.find().sort({ createdAt: -1 }).limit(10).populate('passenger driver', 'name'),
    ]);

  res.json({
    totalRides,
    activeRides,
    totalDrivers,
    totalPassengers,
    revenue: revenue[0]?.total || 0,
    recentRides,
  });
});

// GET /api/admin/rides?status=&page=&limit=
export const rides = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const [rides, total] = await Promise.all([
    Ride.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(+limit)
      .populate('passenger driver', 'name phone avatar'),
    Ride.countDocuments(query),
  ]);
  res.json({ rides, total, page: +page, limit: +limit });
});

// GET /api/admin/drivers
export const drivers = asyncHandler(async (req, res) => {
  const drivers = await User.find({ role: 'driver' }).select('-password');
  res.json({ drivers });
});

// PATCH /api/admin/drivers/:id { driverDetails.isAvailable }
export const toggleDriver = asyncHandler(async (req, res) => {
  const driver = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'driver' },
    { 'driverDetails.isAvailable': req.body.isAvailable },
    { new: true }
  );
  if (!driver) return res.status(404).json({ message: 'Driver not found' });
  res.json({ driver });
});

// GET /api/admin/users
export const users = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ users });
});