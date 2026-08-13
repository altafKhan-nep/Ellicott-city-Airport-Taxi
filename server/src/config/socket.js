import Ride from '../models/Ride.js';

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Associate socket with a user id and join user-scoped room
    socket.on('authenticate', ({ userId, role } = {}) => {
      if (!userId) return;
      if (socket.userId) socket.leave(`user:${socket.userId}`);
      socket.userId = userId;
      socket.role = role;
      socket.join(`user:${userId}`);
      if (role === 'driver') socket.join('drivers');
    });

    // Join a ride-scoped room so passenger + driver share live events
    socket.on('ride:join', ({ rideId } = {}) => {
      if (!rideId) return;
      socket.join(`ride:${rideId}`);
    });

    // Driver publishes position -> forward to the ride room the driver is serving
    socket.on('driver:location', async ({ lat, lng, heading = 0, speed = 0 } = {}) => {
      const driverId = socket.userId;
      if (!driverId || lat == null || lng == null) return;

      const activeRide = await Ride.findOne({
        driver: driverId,
        status: { $in: ['accepted', 'arriving', 'in_progress'] },
      }).select('_id').lean();

      const payload = { driverId, lat, lng, heading, speed };
      if (activeRide) {
        io.to(`ride:${activeRide._id}`).emit('driver:location', payload);
      }
    });

    // Client-triggered ride status publish (validation happens in services)
    socket.on('ride:cancel', ({ rideId } = {}) => {
      if (!rideId) return;
      io.to(`ride:${rideId}`).emit('ride:update', {
        rideId,
        status: 'cancelled',
        by: socket.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};