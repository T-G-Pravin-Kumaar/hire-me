import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5'],
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    unique: true, // Ensured only one review per trip
  },
}, {
  timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
