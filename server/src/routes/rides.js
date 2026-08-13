import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import * as ride from '../controllers/rideController.js';

const router = Router();

// All ride routes require auth
router.use(protect);

router.post('/', requireRole('passenger'), ride.createRide);
router.get('/', ride.listRides);
router.get('/:id', ride.getRide);
router.patch('/:id/accept', requireRole('driver'), ride.acceptRide);
router.patch('/:id/status', requireRole('driver'), ride.updateStatus);
router.patch('/:id/cancel', ride.cancelRide);
router.post('/:id/rate', requireRole('passenger'), ride.rateRide);

export default router;