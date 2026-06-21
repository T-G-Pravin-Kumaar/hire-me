import mongoose from 'mongoose';

const tripRequestSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  driversRequested: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  driversRejected: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'Cancelled'],
    default: 'Pending',
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    }
  },
}, {
  timestamps: true,
});

const TripRequest = mongoose.model('TripRequest', tripRequestSchema);
export default TripRequest;
