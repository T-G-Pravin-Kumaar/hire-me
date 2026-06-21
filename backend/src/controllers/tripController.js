import Trip from '../models/Trip.js';
import TripRequest from '../models/TripRequest.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { calculateHaversineDistance } from '../utils/distance.js';

// @desc    Calculate fare estimate before booking
// @route   POST /api/trips/fare
// @access  Private
export const calculateFareEstimate = async (req, res) => {
  const { source, destination, driverUserId } = req.body;

  try {
    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination coordinates are required' });
    }

    const tripDistance = calculateHaversineDistance(source.lat, source.lng, destination.lat, destination.lng);
    const tripFare = tripDistance * 8; // Trip Fare: distance * ₹8

    let returnDistance = 0;
    let returnFare = 0;

    if (driverUserId) {
      const driver = await Driver.findOne({ user: driverUserId });
      if (driver) {
        returnDistance = calculateHaversineDistance(
          destination.lat,
          destination.lng,
          driver.homeLocation.lat,
          driver.homeLocation.lng
        );
        returnFare = returnDistance * 1; // Return Compensation: distance * ₹1
      }
    }

    const totalFare = tripFare + returnFare;

    return res.json({
      distance: tripDistance,
      tripFare: parseFloat(tripFare.toFixed(2)),
      returnDistance: parseFloat(returnDistance.toFixed(2)),
      returnFare: parseFloat(returnFare.toFixed(2)),
      totalFare: parseFloat(totalFare.toFixed(2))
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new trip request for multiple drivers
// @route   POST /api/trips/request
// @access  Private (Customer)
export const createTripRequest = async (req, res) => {
  const { source, destination, serviceType, vehicleSkill, minRating, genderPreference, scheduledTime, tip } = req.body;

  try {
    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination coordinates are required' });
    }

    // 1. Check if customer already has an active booking or trip request
    const activeTrip = await Trip.findOne({
      customer: req.user._id,
      status: { $in: ['Created', 'Requested', 'Assigned', 'On Trip'] }
    });
    if (activeTrip) {
      return res.status(400).json({ message: 'You already have an active booking/request.' });
    }

    // 2. Perform requirement-based matching to find driver IDs
    const userFilter = { role: 'driver' };
    if (genderPreference && genderPreference !== 'Any') {
      userFilter.gender = genderPreference;
    }
    const matchedUsers = await User.find(userFilter);
    const matchedUserIds = matchedUsers.map(u => u._id);

    const driverFilter = {
      user: { $in: matchedUserIds },
      status: 'Verified',
      availability: 'Available',
      eligibility: { $in: ['Eligible', 'Probation'] }
    };

    if (serviceType) {
      if (serviceType === 'Customer Car') {
        driverFilter.serviceType = { $in: ['Customer Car', 'Both'] };
      } else if (serviceType === 'Own Car') {
        driverFilter.serviceType = { $in: ['Own Car', 'Both'] };
      }
    }

    if (vehicleSkill && vehicleSkill !== 'Both') {
      driverFilter.vehicleSkill = { $in: [vehicleSkill, 'Both'] };
    }

    if (minRating && minRating !== 'Any') {
      driverFilter.averageRating = { $gte: parseFloat(minRating) };
    }

    const matchingDrivers = await Driver.find(driverFilter);
    const matchedDriverUserIds = matchingDrivers.map(d => d.user);

    // Calculate initial base fare
    const distance = calculateHaversineDistance(source.lat, source.lng, destination.lat, destination.lng);
    const baseFare = distance * 8;
    const finalTip = parseFloat(tip) || 0;
    const initialTotalFare = baseFare + finalTip;

    const noDrivers = matchedDriverUserIds.length === 0;

    // Create the Trip
    const trip = await Trip.create({
      customer: req.user._id,
      driver: null,
      source,
      destination,
      distance,
      tripFare: parseFloat(baseFare.toFixed(2)),
      returnFare: 0,
      tip: finalTip,
      totalFare: parseFloat(initialTotalFare.toFixed(2)),
      status: noDrivers ? 'Closed' : 'Requested',
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      serviceTypePreference: serviceType || null,
      vehicleSkillPreference: vehicleSkill || null,
      minRatingPreference: minRating || null,
      genderPreference: genderPreference || null
    });

    // Create the TripRequest
    const tripRequest = await TripRequest.create({
      trip: trip._id,
      driversRequested: matchedDriverUserIds,
      driversRejected: [],
      status: noDrivers ? 'Cancelled' : 'Pending',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
    });

    return res.status(201).json({
      message: noDrivers ? 'No matching drivers found. Please try increasing the tip and retrying.' : 'Trip request created and broadcasted.',
      trip,
      tripRequest
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending requests for logged-in driver
// @route   GET /api/trips/driver/requests
// @access  Private (Driver)
export const getDriverRequests = async (req, res) => {
  try {
    // 1. Run auto-expiry check
    const now = new Date();
    const expiredRequests = await TripRequest.find({
      status: 'Pending',
      expiresAt: { $lte: now }
    });
    for (const r of expiredRequests) {
      r.status = 'Cancelled';
      await r.save();
      await Trip.findByIdAndUpdate(r.trip, { status: 'Closed' });
    }

    // Find all active requests targeting this driver
    const requests = await TripRequest.find({
      driversRequested: req.user._id,
      driversRejected: { $ne: req.user._id },
      status: 'Pending'
    })
    .populate({
      path: 'trip',
      populate: { path: 'customer', select: 'name phone email' }
    });

    // Filter requests where trip status is 'Requested'
    const activeRequests = requests.filter(req => req.trip && req.trip.status === 'Requested');

    // Calculate fares specifically for this driver's return compensation
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    const requestsWithSpecificFares = activeRequests.map(reqObj => {
      const trip = reqObj.trip.toObject();
      const returnDistance = calculateHaversineDistance(
        trip.destination.lat,
        trip.destination.lng,
        driver.homeLocation.lat,
        driver.homeLocation.lng
      );
      const returnFare = returnDistance * 1;
      const totalFare = trip.tripFare + returnFare + (trip.tip || 0);

      trip.returnFare = parseFloat(returnFare.toFixed(2));
      trip.totalFare = parseFloat(totalFare.toFixed(2));

      return {
        ...reqObj.toObject(),
        trip
      };
    });

    return res.json(requestsWithSpecificFares);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Accept or reject a trip request
// @route   PUT /api/trips/request/:id/respond
// @access  Private (Driver)
export const respondToRequest = async (req, res) => {
  const { id } = req.params; // TripRequest ID
  const { action } = req.body; // 'accept' or 'reject'

  try {
    const tripRequest = await TripRequest.findById(id);
    if (!tripRequest) {
      return res.status(404).json({ message: 'Trip request not found' });
    }

    if (tripRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Trip already assigned or cancelled' });
    }

    const trip = await Trip.findById(tripRequest.trip);
    if (!trip || trip.status !== 'Requested') {
      return res.status(400).json({ message: 'Trip already assigned or cancelled' });
    }

    // Expiry Check
    if (tripRequest.expiresAt && new Date() > new Date(tripRequest.expiresAt)) {
      tripRequest.status = 'Cancelled';
      trip.status = 'Closed';
      await tripRequest.save();
      await trip.save();
      return res.status(400).json({ message: 'This booking request has expired.' });
    }

    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    // Verification check
    if (driver.status !== 'Verified') {
      return res.status(403).json({ message: 'You cannot accept trips until your license is verified by the Admin.' });
    }

    // Eligibility check
    if (driver.eligibility && !['Eligible', 'Probation'].includes(driver.eligibility)) {
      return res.status(403).json({ message: `You cannot take trips. Your current eligibility status is: ${driver.eligibility}` });
    }

    if (action === 'accept') {
      // 1. Double check availability
      if (driver.availability !== 'Available') {
        return res.status(400).json({ message: `Cannot accept trip. Your current status is ${driver.availability}` });
      }

      // First acceptance wins! Lock in trip
      const returnDistance = calculateHaversineDistance(
        trip.destination.lat,
        trip.destination.lng,
        driver.homeLocation.lat,
        driver.homeLocation.lng
      );
      const returnFare = returnDistance * 1;
      const totalFare = trip.tripFare + returnFare + (trip.tip || 0);

      trip.driver = req.user._id;
      trip.status = 'Assigned';
      trip.returnFare = parseFloat(returnFare.toFixed(2));
      trip.totalFare = parseFloat(totalFare.toFixed(2));
      await trip.save();

      // Update Driver status
      driver.availability = 'On Trip';
      await driver.save();

      // Update TripRequest
      tripRequest.assignedDriver = req.user._id;
      tripRequest.status = 'Assigned';
      await tripRequest.save();

      return res.json({
        message: 'Trip accepted successfully',
        trip,
        tripRequest
      });
    } else if (action === 'reject') {
      // Add driver to rejected list
      if (!tripRequest.driversRejected.includes(req.user._id)) {
        tripRequest.driversRejected.push(req.user._id);
      }

      // Check if all requested drivers have rejected
      const allRejected = tripRequest.driversRequested.every(drvId => 
        tripRequest.driversRejected.includes(drvId)
      );

      if (allRejected) {
        tripRequest.status = 'Cancelled';
        trip.status = 'Closed';
        await trip.save();
      }

      await tripRequest.save();

      return res.json({
        message: 'Trip request rejected successfully',
        tripRequest
      });
    } else {
      return res.status(400).json({ message: 'Invalid action. Must be accept or reject.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update trip status (e.g., On Trip, Completed)
// @route   PUT /api/trips/:id/status
// @access  Private (Driver/Customer/Admin)
export const updateTripStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Role checks
    if (req.user.role === 'driver' && String(trip.driver) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }

    if (req.user.role === 'customer' && String(trip.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }

    const validStatuses = ['On Trip', 'Completed', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    trip.status = status;
    await trip.save();

    // Side effects of trip status changes
    if (status === 'Completed') {
      // Find and update driver details
      const driver = await Driver.findOne({ user: trip.driver });
      if (driver) {
        driver.completedTrips += 1;
        driver.availability = 'Resting';
        driver.lastTripCompletedAt = new Date();
        
        // Auto-move driver's current position to the trip destination!
        driver.currentLocation = {
          name: trip.destination.name,
          lat: trip.destination.lat,
          lng: trip.destination.lng
        };
        await driver.save();
      }
    } else if (status === 'Closed') {
      // If trip is closed/cancelled, release the driver if they were assigned
      if (trip.driver) {
        const driver = await Driver.findOne({ user: trip.driver });
        if (driver && driver.availability === 'On Trip') {
          driver.availability = 'Available';
          await driver.save();
        }
      }
    }

    return res.json({
      message: `Trip status updated to ${status}`,
      trip
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get trip history for user
// @route   GET /api/trips/history
// @access  Private
export const getUserTrips = async (req, res) => {
  try {
    // Auto-expire requests before fetching history
    const now = new Date();
    const expiredRequests = await TripRequest.find({
      status: 'Pending',
      expiresAt: { $lte: now }
    });
    for (const r of expiredRequests) {
      r.status = 'Cancelled';
      await r.save();
      await Trip.findByIdAndUpdate(r.trip, { status: 'Closed' });
    }

    let query = {};
    if (req.user.role === 'customer') {
      query = { customer: req.user._id };
    } else if (req.user.role === 'driver') {
      query = { driver: req.user._id };
    }

    const trips = await Trip.find(query)
      .populate('customer', 'name phone email')
      .populate('driver', 'name phone email')
      .sort({ createdAt: -1 });

    // Populate reviews & driver profiles for history convenience
    const tripsWithDetails = await Promise.all(trips.map(async (trip) => {
      const review = await mongoose.model('Review').findOne({ trip: trip._id });
      let driverProfile = null;
      let tripRequest = null;
      if (trip.driver) {
        driverProfile = await Driver.findOne({ user: trip.driver._id }).populate('user', 'name phone email');
      }
      if (trip.status === 'Requested' || trip.status === 'Closed') {
        tripRequest = await TripRequest.findOne({ trip: trip._id });
      }
      return {
        ...trip.toObject(),
        review: review || null,
        driverProfile: driverProfile || null,
        tripRequest: tripRequest || null
      };
    }));

    return res.json(tripsWithDetails);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Report customer vehicle as unsafe/unfit
// @route   PUT /api/trips/:id/report-unsafe
// @access  Private (Driver)
export const reportCustomerVehicleUnsafe = async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  try {
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Must be the assigned driver
    if (String(trip.driver) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to report vehicle for this trip.' });
    }

    if (!['Assigned', 'On Trip'].includes(trip.status)) {
      return res.status(400).json({ message: 'Vehicle can only be reported unsafe for active trips.' });
    }

    // 1. Cancel/Close the trip
    trip.status = 'Closed';
    await trip.save();

    // 2. Set driver availability back to Available
    const driver = await Driver.findOne({ user: req.user._id });
    if (driver) {
      driver.availability = 'Available';
      await driver.save();
    }

    // 3. Create a safety complaint to notify admin
    const Complaint = (await import('../models/Complaint.js')).default;
    await Complaint.create({
      trip: trip._id,
      reporter: req.user._id,
      reportedUser: trip.customer,
      type: 'UnsafeVehicle',
      description: description || 'Driver reported the customer vehicle as unsafe/unfit.',
      status: 'Pending'
    });

    return res.json({
      message: 'Vehicle reported as unsafe. Trip has been cancelled and Admin has been notified.',
      trip
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

import mongoose from 'mongoose';
