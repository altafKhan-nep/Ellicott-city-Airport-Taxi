import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import * as admin from '../controllers/adminController.js';

const router = Router();

router.use(protect, requireRole('admin'));

router.get('/analytics', admin.analytics);
router.get('/rides', admin.rides);
router.get('/drivers', admin.drivers);
router.patch('/drivers/:id', admin.toggleDriver);
router.get('/users', admin.users);

export default router;