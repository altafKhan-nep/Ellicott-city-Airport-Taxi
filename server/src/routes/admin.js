import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import * as admin from '../controllers/adminController.js';
import * as catalogAdmin from '../controllers/catalogAdminController.js';

const router = Router();

router.use(protect, requireRole('admin'));

router.get('/analytics', admin.analytics);
router.get('/rides', admin.rides);
router.patch('/rides/:id/driver', admin.assignDriver);
router.get('/drivers', admin.drivers);
router.patch('/drivers/:id', admin.toggleDriver);
router.get('/users', admin.users);
router.patch('/users/:id/suspend', admin.suspendUser);
router.patch('/users/:id/unsuspend', admin.unsuspendUser);
router.delete('/users/:id', admin.deleteUser);
router.get('/payments', admin.payments);
router.get('/settings', admin.settings);
router.get('/content', admin.adminContent);
router.patch('/content', admin.adminUpdateContent);
router.patch('/settings', admin.updateAppSettings);

// Fleet classes + service offerings (what a passenger can book).
router.get('/fleet', catalogAdmin.fleet);
router.post('/fleet', catalogAdmin.createVehicle);
router.patch('/fleet/reorder', catalogAdmin.reorderFleet);
router.post('/fleet/restore-defaults', catalogAdmin.restoreFleet);
router.patch('/fleet/:id', catalogAdmin.updateVehicle);
router.delete('/fleet/:id', catalogAdmin.deleteVehicle);
router.get('/services', catalogAdmin.services);
router.post('/services', catalogAdmin.createService);
router.patch('/services/reorder', catalogAdmin.reorderServices);
router.post('/services/restore-defaults', catalogAdmin.restoreServices);
router.patch('/services/:id', catalogAdmin.updateService);
router.delete('/services/:id', catalogAdmin.deleteService);

export default router;
