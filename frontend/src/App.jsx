import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import SearchDrivers from './pages/customer/SearchDrivers';
import DriverProfileView from './pages/customer/DriverProfileView';
import TripRequests from './pages/customer/TripRequests';
import TripHistory from './pages/customer/TripHistory';

// Driver pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverRequests from './pages/driver/DriverRequests';
import DriverTrips from './pages/driver/DriverTrips';
import DriverProfile from './pages/driver/DriverProfile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminTrips from './pages/admin/AdminTrips';
import AdminReviews from './pages/admin/AdminReviews';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer routes */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/search"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <SearchDrivers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/driver/:id"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DriverProfileView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/requests"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <TripRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/history"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <TripHistory />
                  </ProtectedRoute>
                }
              />

              {/* Driver routes */}
              <Route
                path="/driver/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/requests"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/trips"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverTrips />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/profile"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/drivers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDrivers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminCustomers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/trips"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminTrips />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reviews"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReviews />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
