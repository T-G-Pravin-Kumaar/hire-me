import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tripAPI, driverAPI } from '../../services/api';
import AnalyticsWidget from '../../components/AnalyticsWidget';
import RatingStars from '../../components/RatingStars';
import { Car, MapPin, Calendar, Clock, Star, ArrowRight } from 'lucide-react';

const CustomerDashboard = () => {
  const [activeTrips, setActiveTrips] = useState([]);
  const [topDrivers, setTopDrivers] = useState([]);
  const [stats, setStats] = useState({ totalTrips: 0, spent: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch History to find active and compile statistics
        const { data: trips } = await tripAPI.getHistory();
        const active = trips.filter(t => ['Created', 'Requested', 'Assigned', 'On Trip'].includes(t.status));
        setActiveTrips(active);

        const completed = trips.filter(t => t.status === 'Completed');
        const spentVal = completed.reduce((sum, t) => sum + t.totalFare, 0);
        setStats({
          totalTrips: trips.length,
          spent: parseFloat(spentVal.toFixed(2))
        });

        // 2. Fetch Drivers to recommend
        // Perform a default nearby search using coordinates of Majestic to Indiranagar
        const { data: searchData } = await driverAPI.search({
          sourceLat: 12.9779,
          sourceLng: 77.5707,
          destLat: 12.9719,
          destLng: 77.6412,
          serviceType: 'Customer Car'
        });
        setTopDrivers(searchData.drivers.slice(0, 3));
      } catch (error) {
        console.error('Failed to load dashboard data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome, Rider</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Book verified drivers for your vehicles instantly</p>
      </div>

      {/* Stats Widgets */}
      <div className="metrics-row">
        <AnalyticsWidget
          title="Total Trips Created"
          value={stats.totalTrips}
          icon={<Calendar size={24} />}
        />
        <AnalyticsWidget
          title="Total Spending"
          value={`₹${stats.spent}`}
          icon={<Car size={24} />}
          color="var(--success)"
          bgColor="var(--success-light)"
        />
        <AnalyticsWidget
          title="Active Requests"
          value={activeTrips.length}
          icon={<Clock size={24} />}
          color="var(--info)"
          bgColor="var(--info-light)"
        />
      </div>

      <div className="dashboard-grid">
        {/* Main Content Area */}
        <div className="dashboard-main">
          {/* Active Trips Banner */}
          {activeTrips.length > 0 && (
            <div className="card card-premium" style={{ marginBottom: '32px', borderColor: 'var(--info)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--info)' }}>Active Journey Tracker</h3>
                <span className={`badge badge-${activeTrips[0].status.toLowerCase()}`}>
                  {activeTrips[0].status}
                </span>
              </div>
              <div className="grid grid-2" style={{ gap: '20px' }}>
                <div>
                  <div className="flex items-center gap-2 mb-2" style={{ fontSize: '0.9rem' }}>
                    <MapPin size={16} color="var(--primary-color)" />
                    <span style={{ fontWeight: 600 }}>From: </span> {activeTrips[0].source.name}
                  </div>
                  <div className="flex items-center gap-2 mb-2" style={{ fontSize: '0.9rem' }}>
                    <MapPin size={16} color="var(--success)" />
                    <span style={{ fontWeight: 600 }}>To: </span> {activeTrips[0].destination.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Distance: </span> {activeTrips[0].distance} km
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Fare locked: ₹{activeTrips[0].totalFare}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <Link to="/customer/requests" className="btn btn-primary btn-sm">
                  View Booking Request Details <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Booking shortcut card */}
          <div className="card" style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>Need a Driver?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Set your pickup point and destination to find available verified drivers operating in your proximity. 
              We support manual, automatic, or driver-provided vehicles.
            </p>
            <Link to="/customer/search" className="btn btn-primary">
              <Car size={18} /> Book a New Driver
            </Link>
          </div>
        </div>

        {/* Sidebar / Recommendations */}
        <div className="dashboard-sidebar">
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Top Recommended Drivers</h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading suggestions...</p>
          ) : topDrivers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No drivers nearby currently.</p>
          ) : (
            topDrivers.map((driver) => (
              <div
                key={driver._id}
                className="card"
                style={{ padding: '16px', marginBottom: '16px', cursor: 'pointer' }}
                onClick={() => navigate(`/customer/driver/${driver.user._id}`)}
              >
                <div className="flex items-center gap-4" style={{ marginBottom: '12px' }}>
                  <img
                    src={driver.profilePhoto}
                    alt={driver.user?.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{driver.user?.name}</h4>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                      {driver.vehicleSkill}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
                  <RatingStars rating={driver.averageRating} />
                  <span style={{ color: 'var(--text-muted)' }}>{driver.completedTrips} trips</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
