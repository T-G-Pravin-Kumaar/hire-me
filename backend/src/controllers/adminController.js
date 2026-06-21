import User from '../models/User.js';
import Driver from '../models/Driver.js';
import Customer from '../models/Customer.js';
import Trip from '../models/Trip.js';
import Review from '../models/Review.js';

// @desc    Get dashboard platform-wide metrics
// @route   GET /api/admin/metrics
// @access  Private (Admin)
export const getPlatformMetrics = async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments();
    const completedTrips = await Trip.countDocuments({ status: 'Completed' });
    
    // Calculate total revenue from completed trips
    const completedTripsData = await Trip.find({ status: 'Completed' });
    const totalEarnings = completedTripsData.reduce((sum, trip) => sum + (trip.totalFare || 0), 0);

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const pendingVerifications = await Driver.countDocuments({ status: 'Pending' });

    // Recent trips for preview
    const recentTrips = await Trip.find()
      .populate('customer', 'name')
      .populate('driver', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      metrics: {
        totalTrips,
        completedTrips,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalCustomers,
        totalDrivers,
        pendingVerifications
      },
      recentTrips
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all drivers with status filters
// @route   GET /api/admin/drivers
// @access  Private (Admin)
export const getDrivers = async (req, res) => {
  const { status } = req.query;

  try {
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const drivers = await Driver.find(filter)
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    return res.json(drivers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Verify and update driver profile (status, eligibility, availability)
// @route   PUT /api/admin/drivers/:id/verify
// @access  Private (Admin)
export const verifyDriver = async (req, res) => {
  const { id } = req.params; // Driver ID
  const { status, eligibility, availability } = req.body;

  try {
    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    if (status) {
      if (!['Pending', 'Verified', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'Pending', 'Verified', or 'Rejected'" });
      }
      driver.status = status;
    }

    if (eligibility) {
      if (!['Eligible', 'Probation', 'Suspended', 'Removed'].includes(eligibility)) {
        return res.status(400).json({ message: "Invalid eligibility value." });
      }
      driver.eligibility = eligibility;
    }

    if (availability) {
      if (!['Available', 'On Trip', 'Resting'].includes(availability)) {
        return res.status(400).json({ message: "Invalid availability value." });
      }
      driver.availability = availability;
      if (availability === 'Resting') {
        driver.lastTripCompletedAt = new Date();
      }
    }

    await driver.save();

    return res.json({
      message: `Driver settings successfully updated`,
      driver
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private (Admin)
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  const { id } = req.params; // User ID

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Role specific cleanup
    if (user.role === 'driver') {
      await Driver.deleteOne({ user: id });
    } else if (user.role === 'customer') {
      await Customer.deleteOne({ user: id });
    }

    // Delete base User
    await User.deleteOne({ _id: id });

    return res.json({ message: 'User and profile successfully deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all trips
// @route   GET /api/admin/trips
// @access  Private (Admin)
export const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('customer', 'name phone email')
      .populate('driver', 'name phone email')
      .sort({ createdAt: -1 });

    return res.json(trips);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private (Admin)
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customer', 'name')
      .populate('driver', 'name')
      .populate('trip', 'source destination')
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints/unsafe reports
// @route   GET /api/admin/complaints
// @access  Private (Admin)
export const getComplaints = async (req, res) => {
  try {
    const Complaint = (await import('../models/Complaint.js')).default;
    const complaints = await Complaint.find()
      .populate({
        path: 'trip',
        select: 'source destination distance totalFare status'
      })
      .populate('reporter', 'name phone email role')
      .populate('reportedUser', 'name phone email role')
      .sort({ createdAt: -1 });

    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
