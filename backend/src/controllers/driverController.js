import Driver from '../models/Driver.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { calculateHaversineDistance } from '../utils/distance.js';
import { checkAndReleaseRestingDrivers } from '../middleware/authMiddleware.js';

// @desc    Search drivers
// @route   GET /api/drivers/search
// @access  Private (Customer)
export const searchDrivers = async (req, res) => {
  const {
    sourceLat, sourceLng, sourceName,
    destLat, destLng, destName,
    serviceType, vehicleSkill,
    minRating, minReviews, minTrips,
    sortBy // 'highestRated', 'mostExperienced', 'nearest'
  } = req.query;

  try {
    // 1. Release any resting drivers whose 8 hours are up
    await checkAndReleaseRestingDrivers();

    if (!sourceLat || !sourceLng || !destLat || !destLng || !serviceType) {
      return res.status(400).json({ message: 'Source coordinates, destination coordinates, and service type are required' });
    }

    const sLat = parseFloat(sourceLat);
    const sLng = parseFloat(sourceLng);
    const dLat = parseFloat(destLat);
    const dLng = parseFloat(destLng);

    // 2. Build mongoose filter
    // Only verified and available drivers appear in search
    const filter = {
      status: 'Verified',
      availability: 'Available'
    };

    // Filter by Service Type (Customer Car / Own Car / Both)
    if (serviceType === 'Customer Car') {
      filter.serviceType = { $in: ['Customer Car', 'Both'] };
    } else if (serviceType === 'Own Car') {
      filter.serviceType = { $in: ['Own Car', 'Both'] };
    } else if (serviceType === 'Both') {
      filter.serviceType = 'Both';
    }

    // Filter by Vehicle Skill
    if (vehicleSkill) {
      if (vehicleSkill === 'Manual') {
        filter.vehicleSkill = { $in: ['Manual', 'Both'] };
      } else if (vehicleSkill === 'Automatic') {
        filter.vehicleSkill = { $in: ['Automatic', 'Both'] };
      } else if (vehicleSkill === 'Both') {
        filter.vehicleSkill = 'Both';
      }
    }

    // Filter by ratings and history
    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }
    if (minReviews) {
      filter.totalReviews = { $gte: parseInt(minReviews) };
    }
    if (minTrips) {
      filter.completedTrips = { $gte: parseInt(minTrips) };
    }

    // Fetch matching drivers and populate User info
    let drivers = await Driver.find(filter).populate('user', 'name email phone');

    // 3. Compute distance, fare, and return compensation for each driver
    const tripDistance = calculateHaversineDistance(sLat, sLng, dLat, dLng);
    const tripFare = tripDistance * 8; // Trip Fare: distance * ₹8

    let driversWithFares = drivers.map((driver) => {
      // Distance from driver's current location to source
      const proximityDistance = calculateHaversineDistance(
        driver.currentLocation.lat,
        driver.currentLocation.lng,
        sLat,
        sLng
      );

      // Distance from destination to driver's home location
      const returnDistance = calculateHaversineDistance(
        dLat,
        dLng,
        driver.homeLocation.lat,
        driver.homeLocation.lng
      );

      const returnFare = returnDistance * 1; // Return Compensation: distance * ₹1
      const totalFare = tripFare + returnFare;

      return {
        ...driver.toObject(),
        proximityDistance,
        tripDistance,
        tripFare: parseFloat(tripFare.toFixed(2)),
        returnFare: parseFloat(returnFare.toFixed(2)),
        totalFare: parseFloat(totalFare.toFixed(2))
      };
    });

    // 4. Sort drivers
    if (sortBy === 'highestRated') {
      driversWithFares.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'mostExperienced') {
      driversWithFares.sort((a, b) => b.completedTrips - a.completedTrips);
    } else {
      // Default: nearest driver to source
      driversWithFares.sort((a, b) => a.proximityDistance - b.proximityDistance);
    }

    return res.json({
      tripDistance,
      tripFare: parseFloat(tripFare.toFixed(2)),
      drivers: driversWithFares
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get driver profile by user ID
// @route   GET /api/drivers/profile/:userId
// @access  Private
export const getDriverProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const driver = await Driver.findOne({ user: userId }).populate('user', 'name email phone');
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    // Get public reviews for this driver
    const reviews = await Review.find({ driver: userId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    return res.json({
      driver,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update driver profile & availability
// @route   PUT /api/drivers/profile
// @access  Private (Driver)
export const updateDriverProfile = async (req, res) => {
  const { vehicleSkill, serviceType, availability, currentLocation, homeLocation } = req.body;

  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    // Don't allow changing availability manually if currently on a trip
    if (driver.availability === 'On Trip' && availability && availability !== 'On Trip') {
      return res.status(400).json({ message: 'Cannot manually change availability while on an active trip' });
    }

    if (vehicleSkill) driver.vehicleSkill = vehicleSkill;
    if (serviceType) driver.serviceType = serviceType;
    if (availability) driver.availability = availability;
    if (currentLocation) driver.currentLocation = currentLocation;
    if (homeLocation) driver.homeLocation = homeLocation;

    await driver.save();
    
    // Fetch updated driver with populated user details
    const updatedDriver = await Driver.findOne({ user: req.user._id }).populate('user', 'name email phone');

    return res.json({
      message: 'Profile updated successfully',
      driver: updatedDriver
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
