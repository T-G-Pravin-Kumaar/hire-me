import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['UnsafeVehicle', 'DriverConduct', 'CustomerConduct', 'Other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Resolved'],
    default: 'Pending',
  }
}, {
  timestamps: true,
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
