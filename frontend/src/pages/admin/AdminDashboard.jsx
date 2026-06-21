import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AnalyticsWidget from '../../components/AnalyticsWidget';
import { Shield, Users, DollarSign, Car, Calendar, Compass, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      const { data: metricsData } = await adminAPI.getMetrics();
      setData(metricsData);
    } catch (err) {
      setError('Failed to fetch platform metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <div className="container"><p>Loading admin analytics...</p></div>;

  const { metrics, recentTrips } = data || {};

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Platform Administration</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Live platform metrics, registration verifications, and audit logs</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchMetrics}>
          <RefreshCw size={14} style={{ marginRight: '4px' }} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* KPI Widgets Grid */}
      <div className="metrics-row">
        <AnalyticsWidget
          title="Gross Revenue Transacted"
          value={`₹${metrics.totalEarnings}`}
          icon={<DollarSign size={24} />}
          color="var(--success)"
          bgColor="var(--success-light)"
        />
        <AnalyticsWidget
          title="Verification Queue"
          value={metrics.pendingVerifications}
          icon={<Shield size={24} />}
          color="var(--warning)"
          bgColor="var(--warning-light)"
        />
        <AnalyticsWidget
          title="Total Registered Drivers"
          value={metrics.totalDrivers}
          icon={<Car size={24} />}
        />
        <AnalyticsWidget
          title="Total Active Customers"
          value={metrics.totalCustomers}
          icon={<Users size={24} />}
          color="var(--info)"
          bgColor="var(--info-light)"
        />
      </div>

      <div className="dashboard-grid">
        {/* Main Section - Recent Trips */}
        <div className="dashboard-main">
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> Recent Platform Bookings
            </h3>

            {recentTrips.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No trip requests logged yet.</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Trip ID</th>
                      <th>Customer</th>
                      <th>Driver</th>
                      <th>Fare</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip) => (
                      <tr key={trip._id}>
                        <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{trip._id.slice(-6).toUpperCase()}</td>
                        <td>{trip.customer?.name || 'Customer'}</td>
                        <td>{trip.driver?.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}</td>
                        <td style={{ fontWeight: 700 }}>₹{trip.totalFare}</td>
                        <td>
                          <span className={`badge badge-${trip.status.toLowerCase()}`}>{trip.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="dashboard-sidebar">
          {metrics.pendingVerifications > 0 && (
            <div className="card text-center" style={{ borderColor: 'var(--warning)', backgroundColor: 'var(--warning-light)' }}>
              <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.9rem' }}>Attention Required</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: '8px 0', color: 'var(--warning)' }}>
                {metrics.pendingVerifications} Pending
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                There are drivers waiting in the verification queue. Review their licenses to list them on the platform.
              </p>
              <Link to="/admin/drivers" className="btn btn-primary btn-sm w-full" style={{ backgroundColor: 'var(--warning)', borderColor: 'var(--warning)', boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.4)' }}>
                Open Queue
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
