import express from 'express';
import {
  getPlatformMetrics,
  getDrivers,
  verifyDriver,
  getCustomers,
  deleteUser,
  getTrips,
  getReviews,
  getComplaints
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin')); // All admin endpoints are protected and restricted to admin role

router.get('/metrics', getPlatformMetrics);
router.get('/drivers', getDrivers);
router.put('/drivers/:id/verify', verifyDriver);
router.get('/customers', getCustomers);
router.delete('/users/:id', deleteUser);
router.get('/trips', getTrips);
router.get('/reviews', getReviews);
router.get('/complaints', getComplaints);

export default router;
