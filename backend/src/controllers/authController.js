import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import Customer from '../models/Customer.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hireme_secret_key_jwt_token_auth', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, phone, role, gender } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Validate role
    if (!['driver', 'customer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be customer or driver.' });
    }

    // 3. Role specific checks
    if (role === 'driver') {
      const {
        dob, address, profilePhoto, currentLocation,
        homeLocation, licenseNumber, licenseDocument,
        vehicleSkill, serviceType
      } = req.body;

      if (!dob || !address || !profilePhoto || !currentLocation || !homeLocation || !licenseNumber || !licenseDocument || !vehicleSkill || !serviceType) {
        return res.status(400).json({ message: 'All driver registration details are required' });
      }

      // Age verification (must be >= 18)
      const ageDiffMs = Date.now() - new Date(dob).getTime();
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age < 18) {
        return res.status(400).json({ message: 'Driver must be at least 18 years old' });
      }

      // Create base user
      const user = await User.create({ name, email, password, phone, role, gender: gender || 'Other' });

      // Create driver profile
      await Driver.create({
        user: user._id,
        dob,
        address,
        profilePhoto,
        currentLocation,
        homeLocation,
        licenseNumber,
        licenseDocument,
        vehicleSkill,
        serviceType,
        status: 'Pending',
        availability: 'Available',
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        gender: user.gender,
        token: generateToken(user._id),
      });
    } else {
      // Customer registration
      const { address } = req.body;
      if (!address || !address.trim()) {
        return res.status(400).json({ message: 'Home Address is required' });
      }

      // Create base user
      const user = await User.create({ name, email, password, phone, role, gender: gender || 'Other' });

      // Create customer profile
      await Customer.create({
        user: user._id,
        address: address,
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        gender: user.gender,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.comparePassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'driver') {
      profile = await Driver.findOne({ user: user._id });
    } else if (user.role === 'customer') {
      profile = await Customer.findOne({ user: user._id });
    }

    return res.json({
      user,
      profile,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
