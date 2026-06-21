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

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  profilePhoto: {
    type: String, // Base64 or placeholder URL
    required: [true, 'Profile photo is required'],
  },
  currentLocation: {
    type: locationSchema,
    required: true,
  },
  homeLocation: {
    type: locationSchema,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    trim: true,
  },
  licenseDocument: {
    type: String, // Base64 or placeholder URL
    required: [true, 'License document is required'],
  },
  vehicleSkill: {
    type: String,
    enum: ['Manual', 'Automatic', 'Both'],
    required: [true, 'Vehicle skill is required'],
  },
  serviceType: {
    type: String,
    enum: ['Customer Car', 'Own Car', 'Both'],
    required: [true, 'Service type is required'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  eligibility: {
    type: String,
    enum: ['Eligible', 'Probation', 'Suspended', 'Removed'],
    default: 'Eligible',
  },
  availability: {
    type: String,
    enum: ['Available', 'On Trip', 'Resting'],
    default: 'Available',
  },
  lastTripCompletedAt: {
    type: Date,
  },
  completedTrips: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
