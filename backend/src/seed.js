import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Driver from './models/Driver.js';
import Customer from './models/Customer.js';
import Trip from './models/Trip.js';
import TripRequest from './models/TripRequest.js';
import Review from './models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hire-me');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Driver.deleteMany();
    await Customer.deleteMany();
    await Trip.deleteMany();
    await TripRequest.deleteMany();
    await Review.deleteMany();
    console.log('Wiped all existing collections.');

    // Password Hashing Helper (bypass schema pre-save issues if running manually)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@hireme.com',
      password: 'password123', // Will be hashed by pre-save hook
      phone: '9876543210',
      role: 'admin',
      gender: 'Male'
    });
    console.log('Seeded Admin account.');

    // 2. Create Customers
    const customerUser1 = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan@gmail.com',
      password: 'password123',
      phone: '9123456780',
      role: 'customer',
      gender: 'Male'
    });
    await Customer.create({
      user: customerUser1._id,
      address: 'Indiranagar, Bengaluru'
    });

    const customerUser2 = await User.create({
      name: 'Pooja Patel',
      email: 'pooja@gmail.com',
      password: 'password123',
      phone: '9234567890',
      role: 'customer',
      gender: 'Female'
    });
    await Customer.create({
      user: customerUser2._id,
      address: 'Whitefield, Bengaluru'
    });
    console.log('Seeded 2 Customer accounts.');

    // 3. Create Drivers
    // Driver 1: Verified, Available, Manual, Customer Car
    const driverUser1 = await User.create({
      name: 'Suresh Kumar',
      email: 'suresh@driver.com',
      password: 'password123',
      phone: '9345678901',
      role: 'driver',
      gender: 'Male'
    });
    const driver1 = await Driver.create({
      user: driverUser1._id,
      dob: new Date('1990-05-15'),
      address: 'Majestic, Bengaluru',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      currentLocation: {
        name: 'Majestic Bus Station',
        lat: 12.9779,
        lng: 77.5707
      },
      homeLocation: {
        name: 'Majestic Bus Station',
        lat: 12.9779,
        lng: 77.5707
      },
      licenseNumber: 'KA-01-2015-09876',
      licenseDocument: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=300&auto=format&fit=crop',
      vehicleSkill: 'Manual',
      serviceType: 'Customer Car',
      status: 'Verified',
      availability: 'Available',
      completedTrips: 12,
      averageRating: 4.8,
      totalReviews: 2
    });

    // Driver 2: Verified, Available, Both (skills), Both (services)
    const driverUser2 = await User.create({
      name: 'Vikram Singh',
      email: 'vikram@driver.com',
      password: 'password123',
      phone: '9456789012',
      role: 'driver',
      gender: 'Male'
    });
    const driver2 = await Driver.create({
      user: driverUser2._id,
      dob: new Date('1988-11-20'),
      address: 'Indiranagar, Bengaluru',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      currentLocation: {
        name: 'Indiranagar Metro Station',
        lat: 12.9719,
        lng: 77.6412
      },
      homeLocation: {
        name: 'Indiranagar Metro Station',
        lat: 12.9719,
        lng: 77.6412
      },
      licenseNumber: 'KA-03-2012-12345',
      licenseDocument: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=300&auto=format&fit=crop',
      vehicleSkill: 'Both',
      serviceType: 'Both',
      status: 'Verified',
      availability: 'Available',
      completedTrips: 25,
      averageRating: 4.6,
      totalReviews: 1
    });

    // Driver 3: Verified, Resting (last completed trip 2 hours ago)
    const driverUser3 = await User.create({
      name: 'Karan Malhotra',
      email: 'karan@driver.com',
      password: 'password123',
      phone: '9567890123',
      role: 'driver',
      gender: 'Male'
    });
    const driver3 = await Driver.create({
      user: driverUser3._id,
      dob: new Date('1995-02-10'),
      address: 'Whitefield, Bengaluru',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
      currentLocation: {
        name: 'Kempegowda International Airport',
        lat: 13.1986,
        lng: 77.7066
      },
      homeLocation: {
        name: 'Whitefield, Bengaluru',
        lat: 12.9698,
        lng: 77.7500
      },
      licenseNumber: 'KA-53-2018-45678',
      licenseDocument: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=300&auto=format&fit=crop',
      vehicleSkill: 'Automatic',
      serviceType: 'Own Car',
      status: 'Verified',
      availability: 'Resting',
      lastTripCompletedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (still resting)
      completedTrips: 8,
      averageRating: 4.2,
      totalReviews: 1
    });

    // Driver 4: Pending Verification, Available, Both, Both
    const driverUser4 = await User.create({
      name: 'Anil Prasad',
      email: 'anil@driver.com',
      password: 'password123',
      phone: '9678901234',
      role: 'driver',
      gender: 'Male'
    });
    const driver4 = await Driver.create({
      user: driverUser4._id,
      dob: new Date('1992-08-30'),
      address: 'Electronic City, Bengaluru',
      profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
      currentLocation: {
        name: 'Electronic City Phase 1',
        lat: 12.8399,
        lng: 77.6770
      },
      homeLocation: {
        name: 'Electronic City Phase 1',
        lat: 12.8399,
        lng: 77.6770
      },
      licenseNumber: 'KA-51-2016-11223',
      licenseDocument: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=300&auto=format&fit=crop',
      vehicleSkill: 'Both',
      serviceType: 'Both',
      status: 'Pending',
      availability: 'Available',
      completedTrips: 0,
      averageRating: 0,
      totalReviews: 0
    });
    console.log('Seeded 4 Driver accounts.');

    // 4. Seed a completed Trip and Reviews
    // Suresh completed a trip for Rohan
    const trip1 = await Trip.create({
      customer: customerUser1._id,
      driver: driverUser1._id,
      source: { name: 'Majestic Bus Station', lat: 12.9779, lng: 77.5707 },
      destination: { name: 'Indiranagar Metro Station', lat: 12.9719, lng: 77.6412 },
      distance: 8.5,
      tripFare: 68.0, // 8.5 * 8
      returnFare: 8.5, // Indiranagar to Majestic is ~8.5km * 1
      totalFare: 76.5,
      status: 'Completed'
    });

    const review1 = await Review.create({
      rating: 5,
      review: 'Excellent driving skills and very polite behaviour. Highly recommended!',
      customer: customerUser1._id,
      driver: driverUser1._id,
      trip: trip1._id
    });

    // Vikram completed a trip for Rohan
    const trip2 = await Trip.create({
      customer: customerUser1._id,
      driver: driverUser2._id,
      source: { name: 'Whitefield, Bengaluru', lat: 12.9698, lng: 77.7500 },
      destination: { name: 'Indiranagar Metro Station', lat: 12.9719, lng: 77.6412 },
      distance: 12.0,
      tripFare: 96.0, // 12 * 8
      returnFare: 0, // Indiranagar to Indiranagar (Vikram home is Indiranagar)
      totalFare: 96.0,
      status: 'Completed'
    });

    const review2 = await Review.create({
      rating: 4,
      review: 'Good driver, arrived on time and navigated the traffic well.',
      customer: customerUser1._id,
      driver: driverUser2._id,
      trip: trip2._id
    });

    // Karan completed a trip for Pooja
    const trip3 = await Trip.create({
      customer: customerUser2._id,
      driver: driverUser3._id,
      source: { name: 'Indiranagar Metro Station', lat: 12.9719, lng: 77.6412 },
      destination: { name: 'Kempegowda International Airport', lat: 13.1986, lng: 77.7066 },
      distance: 35.0,
      tripFare: 280.0, // 35 * 8
      returnFare: 25.0, // Airport to Whitefield (Karan home)
      totalFare: 305.0,
      status: 'Completed'
    });

    const review3 = await Review.create({
      rating: 4,
      review: 'Safe driving to the airport. Very comfortable trip.',
      customer: customerUser2._id,
      driver: driverUser3._id,
      trip: trip3._id
    });

    console.log('Seeded completed trips and review histories.');

    // 5. Seed a pending Trip Request
    const tripActive = await Trip.create({
      customer: customerUser2._id,
      driver: null,
      source: { name: 'Whitefield, Bengaluru', lat: 12.9698, lng: 77.7500 },
      destination: { name: 'Majestic Bus Station', lat: 12.9779, lng: 77.5707 },
      distance: 21.0,
      tripFare: 168.0,
      returnFare: 0,
      totalFare: 168.0,
      status: 'Requested'
    });

    await TripRequest.create({
      trip: tripActive._id,
      driversRequested: [driverUser1._id, driverUser2._id],
      driversRejected: [],
      status: 'Pending'
    });
    console.log('Seeded an active dispatch trip request.');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedData();
