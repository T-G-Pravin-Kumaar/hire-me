import React, { useState, useEffect } from 'react';
import { tripAPI } from '../../services/api';
import RatingStars from '../../components/RatingStars';
import { Car, MapPin, Play, CheckCircle2, History, AlertCircle } from 'lucide-react';

const DriverTrips = () => {
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTrips = async () => {
    try {
      const { data } = await tripAPI.getHistory();
      setTrips(data);
      
      // Locate current active trip
      const active = data.find(t => ['Assigned', 'On Trip'].includes(t.status));
      setActiveTrip(active || null);
    } catch (err) {
      setError('Failed to fetch trip history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (!activeTrip) return;
    setActionLoading(true);
    setError('');

    try {
      await tripAPI.updateStatus(activeTrip._id, { status: newStatus });
      await fetchTrips();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update trip status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportUnsafe = async () => {
    if (!activeTrip) return;
    const description = window.prompt("Please describe why this customer vehicle is unsafe/unfit:");
    if (description === null) return;
    if (!description.trim()) {
      alert("A safety report description is required.");
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await tripAPI.reportUnsafe(activeTrip._id, { description });
      alert("Safety complaint submitted. The trip has been cancelled.");
      await fetchTrips();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit unsafe vehicle report');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>My Journeys</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage active client trips and view historical driving logs</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading journey lists...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Active Trip Controller Panel */}
          {activeTrip && (
            <div className="card card-premium" style={{ borderColor: 'var(--info)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--info)' }}>Active Ride Controller</h3>
                <span className={`badge badge-${activeTrip.status.toLowerCase()}`}>{activeTrip.status}</span>
              </div>

              <div className="grid grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
                {/* Rider Info */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Rider Contact</h4>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{activeTrip.customer?.name}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Phone: {activeTrip.customer?.phone}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email: {activeTrip.customer?.email}</p>
                </div>

                {/* Route Details */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Route Details</h4>
                  <div className="flex items-center gap-2 mb-1" style={{ fontSize: '0.9rem' }}>
                    <MapPin size={14} color="var(--primary-color)" />
                    <span>Pickup: {activeTrip.source.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2" style={{ fontSize: '0.9rem' }}>
                    <MapPin size={14} color="var(--success)" />
                    <span>Drop-off: {activeTrip.destination.name}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Distance: {activeTrip.distance} km | Fare: ₹{activeTrip.totalFare}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', flexWrap: 'wrap' }}>
                {activeTrip.status === 'Assigned' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStatusChange('On Trip')}
                    disabled={actionLoading}
                  >
                    <Play size={16} /> Start Trip
                  </button>
                )}

                {activeTrip.status === 'On Trip' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStatusChange('Completed')}
                    disabled={actionLoading}
                    style={{ backgroundColor: 'var(--success)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)' }}
                  >
                    <CheckCircle2 size={16} /> Complete Trip
                  </button>
                )}

                {['Assigned', 'On Trip'].includes(activeTrip.status) && (
                  <button
                    className="btn btn-danger"
                    onClick={handleReportUnsafe}
                    disabled={actionLoading}
                    style={{ marginLeft: 'auto' }}
                  >
                    <AlertCircle size={16} /> Report Customer Vehicle Unsafe
                  </button>
                )}
              </div>
              
              {activeTrip.status === 'On Trip' && (
                <div className="flex items-center gap-2 mt-4" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <AlertCircle size={14} />
                  <span>Completing the trip will place you in a mandatory 8-hour resting window.</span>
                </div>
              )}
            </div>
          )}

          {/* Historical Trips Log */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} /> Driving History Log ({trips.filter(t => t.status === 'Completed').length})
            </h3>

            {trips.length === 0 ? (
              <div className="card text-center" style={{ padding: '40px' }}>
                <Car size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-secondary)' }}>No past trips found in your account.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Trip ID</th>
                      <th>Client</th>
                      <th>Distance & Route</th>
                      <th>Earnings</th>
                      <th>Status</th>
                      <th>Rating & Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((trip) => (
                      <tr key={trip._id}>
                        <td style={{ fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>{trip._id.slice(-6).toUpperCase()}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(trip.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{trip.customer?.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{trip.customer?.phone}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>
                            <div><span style={{ color: 'var(--primary-color)' }}>●</span> {trip.source.name}</div>
                            <div><span style={{ color: 'var(--success)' }}>●</span> {trip.destination.name}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.distance} km</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{trip.totalFare}</td>
                        <td>
                          <span className={`badge badge-${trip.status.toLowerCase()}`}>{trip.status}</span>
                        </td>
                        <td>
                          {trip.review ? (
                            <div>
                              <RatingStars rating={trip.review.rating} />
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '4px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                "{trip.review.review}"
                              </p>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No review yet</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default DriverTrips;
