import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Car, History, ClipboardList, Star } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <Link to="/" className="navbar-brand">
          <span>🚗 Hire Me</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Customer navigation */}
              {user.role === 'customer' && (
                <>
                  <Link to="/customer/dashboard" className="flex items-center gap-2 text-sm font-semibold">
                    <ClipboardList size={18} /> Dashboard
                  </Link>
                  <Link to="/customer/search" className="flex items-center gap-2 text-sm font-semibold">
                    <Car size={18} /> Find Drivers
                  </Link>
                  <Link to="/customer/requests" className="flex items-center gap-2 text-sm font-semibold">
                    <ClipboardList size={18} /> Requests
                  </Link>
                  <Link to="/customer/history" className="flex items-center gap-2 text-sm font-semibold">
                    <History size={18} /> Trips
                  </Link>
                </>
              )}

              {/* Driver navigation */}
              {user.role === 'driver' && (
                <>
                  <Link to="/driver/dashboard" className="flex items-center gap-2 text-sm font-semibold">
                    <ClipboardList size={18} /> Dashboard
                  </Link>
                  <Link to="/driver/requests" className="flex items-center gap-2 text-sm font-semibold">
                    <ClipboardList size={18} /> Trip Invitations
                  </Link>
                  <Link to="/driver/trips" className="flex items-center gap-2 text-sm font-semibold">
                    <History size={18} /> My Trips
                  </Link>
                  <Link to="/driver/profile" className="flex items-center gap-2 text-sm font-semibold">
                    <UserIcon size={18} /> Profile
                  </Link>
                </>
              )}

              {/* Admin navigation */}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="flex items-center gap-2 text-sm font-semibold">
                    <Shield size={18} /> Dashboard
                  </Link>
                  <Link to="/admin/drivers" className="flex items-center gap-2 text-sm font-semibold">
                    <Car size={18} /> Verify Drivers
                  </Link>
                  <Link to="/admin/customers" className="flex items-center gap-2 text-sm font-semibold">
                    <UserIcon size={18} /> Customers
                  </Link>
                  <Link to="/admin/trips" className="flex items-center gap-2 text-sm font-semibold">
                    <History size={18} /> Trips
                  </Link>
                  <Link to="/admin/reviews" className="flex items-center gap-2 text-sm font-semibold">
                    <Star size={18} /> Reviews
                  </Link>
                </>
              )}

              <span className={`badge badge-${user.role}`} style={{ marginLeft: '12px' }}>
                {user.role}
              </span>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
