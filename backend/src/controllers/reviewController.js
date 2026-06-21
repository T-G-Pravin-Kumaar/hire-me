import Review from '../models/Review.js';
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';

// @desc    Create a new review for a completed trip
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = async (req, res) => {
  const { rating, review, tripId } = req.body;

  try {
    if (!rating || !review || !tripId) {
      return res.status(400).json({ message: 'Rating, review text, and trip ID are required' });
    }

    // 1. Fetch trip and check requirements
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Completed') {
      return res.status(400).json({ message: 'Reviews can only be submitted for completed trips' });
    }

    if (String(trip.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You are not authorized to review this trip' });
    }

    // 2. Check if already reviewed
    const reviewExists = await Review.findOne({ trip: tripId });
    if (reviewExists) {
      return res.status(400).json({ message: 'You have already submitted a review for this trip' });
    }

    // 3. Create the review
    const newReview = await Review.create({
      rating: parseInt(rating),
      review,
      customer: req.user._id,
      driver: trip.driver,
      trip: tripId,
    });

    // 4. Update Driver stats
    const driverReviews = await Review.find({ driver: trip.driver });
    const totalReviews = driverReviews.length;
    const sumRatings = driverReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = parseFloat((sumRatings / totalReviews).toFixed(2));

    await Driver.updateOne(
      { user: trip.driver },
      {
        $set: {
          averageRating,
          totalReviews
        }
      }
    );

    return res.status(201).json({
      message: 'Review submitted successfully',
      review: newReview
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
