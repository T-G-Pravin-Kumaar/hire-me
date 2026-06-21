import express from 'express';
import { searchDrivers, getDriverProfile, updateDriverProfile } from '../controllers/driverController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All driver actions require login

router.get('/search', restrictTo('customer'), searchDrivers);
router.get('/profile/:userId', getDriverProfile);
router.put('/profile', restrictTo('driver'), updateDriverProfile);

export default router;
