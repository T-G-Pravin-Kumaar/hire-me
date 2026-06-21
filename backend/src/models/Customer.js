import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: [true, 'Home address is required'],
    trim: true,
  },
}, {
  timestamps: true,
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
