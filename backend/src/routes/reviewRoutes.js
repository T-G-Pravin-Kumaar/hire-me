import express from 'express';
import { createReview } from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('customer'), createReview);

export default router;
