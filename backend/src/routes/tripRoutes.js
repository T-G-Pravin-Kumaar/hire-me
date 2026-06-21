import express from 'express';
import {
  calculateFareEstimate,
  createTripRequest,
  getDriverRequests,
  respondToRequest,
  updateTripStatus,
  getUserTrips,
  reportCustomerVehicleUnsafe
} from '../controllers/tripController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All trip routes require authentication

router.post('/fare', calculateFareEstimate);
router.post('/request', restrictTo('customer'), createTripRequest);
router.get('/driver/requests', restrictTo('driver'), getDriverRequests);
router.put('/request/:id/respond', restrictTo('driver'), respondToRequest);
router.put('/:id/status', updateTripStatus);
router.put('/:id/report-unsafe', restrictTo('driver'), reportCustomerVehicleUnsafe);
router.get('/history', getUserTrips);

export default router;
