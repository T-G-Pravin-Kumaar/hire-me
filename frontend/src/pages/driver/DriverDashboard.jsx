import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { driverAPI, tripAPI } from '../../services/api';
import AnalyticsWidget from '../../components/AnalyticsWidget';
import { Car, DollarSign, Clock, CheckCircle, RefreshCw } from 'lucide-react';

const DriverDashboard = () => {
  const { user, profile, refreshUser } = useAuth();
  const [activeTrip, setActiveTrip] = useState(null);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [restTimeLeft, setRestTimeLeft] = useState('');

  const fetchDriverDashboard = async () => {
    try {
      // Refresh auth profile to get latest availability status
      await refreshUser();

      // Fetch trips to calculate earnings and find active
      const { data: trips } = await tripAPI.getHistory();
      const completed = trips.filter(t => t.status === 'Completed');
      const totalEarned = completed.reduce((sum, t) => sum + t.totalFare, 0);
      setEarnings(parseFloat(totalEarned.toFixed(2)));

      const active = trips.find(t => ['Assigned', 'On Trip'].includes(t.status));
      setActiveTrip(active || null);
    } catch (error) {
      console.error('Failed to load driver stats:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverDashboard();
  }, []);

  // Countdown logic for Resting state
  useEffect(() => {
    if (!profile || profile.availability !== 'Resting' || !profile.lastTripCompletedAt) {
      setRestTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const restDurationMs = 8 * 60 * 60 * 1000; // 8 hours
      const completedTime = new Date(profile.lastTripCompletedAt).getTime();
      const releaseTime = completedTime + restDurationMs;
      const timeLeftMs = releaseTime - Date.now();

      if (timeLeftMs <= 0) {
        setRestTimeLeft('');
        clearInterval(interval);
        refreshUser(); // Should auto release to Available
      } else {
        const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);
        setRestTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [profile]);

  const toggleAvailability = async () => {
    if (!profile) return;
    if (profile.availability === 'On Trip') return;

    // Toggle between Available and Resting
    const newStatus = profile.availability === 'Available' ? 'Resting' : 'Available';
    try {
      await driverAPI.updateProfile({
        availability: newStatus,
        // If transitioning to Resting manually, set last completed to now
        lastTripCompletedAt: newStatus === 'Resting' ? new Date() : undefined
      });
      await refreshUser();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading || !profile) {
    return <div className="container"><p>Loading driver dashboard...</p></div>;
  }

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome, {user.name}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your earnings, active rides, and availability</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchDriverDashboard}>
          <RefreshCw size={14} style={{ marginRight: '4px' }} /> Refresh
        </button>
      </div>

      {/* Verification Warning */}
      {profile.status === 'Pending' && (
        <div style={{
          backgroundColor: 'var(--warning-light)',
          color: 'var(--warning)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '32px',
          border: '1px solid rgba(245, 158, 11, 0.2)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Verification Pending</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Your driver profile is currently in the verification queue. Admin will review your license and credentials. 
            Only verified drivers can receive trip requests or appear in passenger searches.
          </p>
        </div>
      )}

      {profile.status === 'Rejected' && (
        <div style={{
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '32px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Verification Rejected</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Your credentials were not approved. Please contact support or update your profile to request re-verification.
          </p>
        </div>
      )}

      {/* Driver Stats */}
      <div className="metrics-row">
        <AnalyticsWidget
          title="Total Driver Earnings"
          value={`₹${earnings}`}
          icon={<DollarSign size={24} />}
          color="var(--success)"
          bgColor="var(--success-light)"
        />
        <AnalyticsWidget
          title="Completed Trips"
          value={profile.completedTrips}
          icon={<CheckCircle size={24} />}
        />
        <AnalyticsWidget
          title="Average Rating"
          value={`${profile.averageRating} ★`}
          icon={<DollarSign size={24} />}
          color="var(--warning)"
          bgColor="var(--warning-light)"
        />
      </div>

      <div className="dashboard-grid">
        {/* Main Content Area */}
        <div className="dashboard-main">
          {/* Active Trip Section */}
          {activeTrip ? (
            <div className="card card-premium" style={{ marginBottom: '32px', borderColor: 'var(--info)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--info)' }}>Current Active Trip</h3>
                <span className={`badge badge-${activeTrip.status.toLowerCase()}`}>{activeTrip.status}</span>
              </div>

              <div className="grid grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Rider: </span> {activeTrip.customer?.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Phone: </span> {activeTrip.customer?.phone}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Route: </span> {activeTrip.source.name} ➔ {activeTrip.destination.name}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    Fare payout: ₹{activeTrip.totalFare}
                  </div>
                </div>
              </div>

              <Link to="/driver/trips" className="btn btn-primary btn-sm">
                Open Trip Controller
              </Link>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>Trip Requests</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
                You don't have any active trip right now. Check your invitation inbox to view booking requests dispatched by riders near your current base location.
              </p>
              <Link to="/driver/requests" className="btn btn-primary" disabled={profile.status !== 'Verified' || profile.availability !== 'Available'}>
                View Invitations Inbox
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar - Availability Status toggler */}
        <div className="dashboard-sidebar">
          <div className="card text-center">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Your Duty Status</h3>
            <div style={{ margin: '20px 0' }}>
              <span className={`badge badge-${profile.availability.toLowerCase()}`} style={{ fontSize: '1.1rem', padding: '8px 20px' }}>
                {profile.availability}
              </span>
            </div>

            {profile.availability === 'Resting' && restTimeLeft && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rest Period Timer</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--danger)', marginTop: '4px' }}>
                  {restTimeLeft}
                </p>
              </div>
            )}

            <button
              onClick={toggleAvailability}
              className={`btn w-full ${profile.availability === 'Available' ? 'btn-danger' : 'btn-primary'}`}
              disabled={profile.availability === 'On Trip' || profile.status !== 'Verified'}
            >
              {profile.availability === 'Available' ? 'Go Off Duty (Resting)' : 'Go Active (Available)'}
            </button>
            
            {profile.status !== 'Verified' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                * Duty toggle is locked until profile verification is complete.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
