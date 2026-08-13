import { asyncHandler } from '../middleware/error.js';
import * as rideService from '../services/rideService.js';
import { updateLocation } from '../services/driverService.js';

// POST /api/rides - passenger requests a ride
export const createRide = asyncHandler(async (req, res) => {
  const ride = await rideService.createRide(req.user._id, req.body);
  // Notify nearby drivers
  req.app.get('io').to('drivers').emit('ride:new', { ride });
  res.status(201).json({ ride });
});

export const listRides = asyncHandler(async (req, res) => {
  const rides = await rideService.listRides(req.user, req.query);
  res.json({ rides });
});

export const getRide = asyncHandler(async (req, res) => {
  const ride = await rideService.getRideById(req.params.id);
  res.json({ ride });
});

export const acceptRide = asyncHandler(async (req, res) => {
  const ride = await rideService.acceptRide(req.params.id, req.user._id);
  const io = req.app.get('io');
  io.to(`ride:${ride._id}`).emit('ride:driverFound', { driver: ride.driver, ride });
  res.json({ ride });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status, lat, lng } = req.body;
  const ride = await rideService.updateStatus(req.params.id, status, req.user._id);
  if (lat != null && lng != null) {
    await updateLocation(req.user._id, { lat, lng });
  }
  const io = req.app.get('io');
  io.to(`ride:${ride._id}`).emit('ride:update', { ride, status: ride.status });
  if (status === 'completed') {
    io.to(`ride:${ride._id}`).emit('ride:completed', { ride, fare: ride.fare });
  }
  res.json({ ride });
});

export const cancelRide = asyncHandler(async (req, res) => {
  const ride = await rideService.cancelRide(req.params.id, req.user._id, req.body.reason);
  req.app.get('io').to(`ride:${ride._id}`).emit('ride:update', { ride, status: 'cancelled' });
  res.json({ ride });
});

export const rateRide = asyncHandler(async (req, res) => {
  const ride = await rideService.rateRide(req.params.id, req.user._id, req.body);
  res.json({ ride });
});