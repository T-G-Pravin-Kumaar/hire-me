import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
}, { _id: false });

const tripSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  source: {
    type: locationSchema,
    required: true,
  },
  destination: {
    type: locationSchema,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  tripFare: {
    type: Number,
    required: true,
  },
  returnFare: {
    type: Number,
    required: true,
  },
  totalFare: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Created', 'Requested', 'Assigned', 'On Trip', 'Completed', 'Closed'],
    default: 'Created',
  },
  scheduledTime: {
    type: Date,
    default: null,
  },
  tip: {
    type: Number,
    default: 0,
  },
  serviceTypePreference: {
    type: String,
    default: null
  },
  vehicleSkillPreference: {
    type: String,
    default: null
  },
  minRatingPreference: {
    type: String,
    default: null
  },
  genderPreference: {
    type: String,
    default: null
  },
}, {
  timestamps: true,
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
