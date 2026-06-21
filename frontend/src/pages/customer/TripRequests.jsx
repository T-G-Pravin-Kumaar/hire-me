import React, { useState, useEffect } from 'react';
import { tripAPI } from '../../services/api';
import RatingStars from '../../components/RatingStars';
import { Clock, MapPin, Compass, AlertCircle, RefreshCw, Send, DollarSign, Calendar } from 'lucide-react';

const ExpiryTimer = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff === 0 && onExpire) {
        onExpire();
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <span style={{ fontWeight: 700, color: timeLeft < 60 ? 'var(--danger)' : 'var(--warning)', fontSize: '0.9rem' }}>
      {timeLeft > 0 ? `Expires in: ${formattedTime}` : 'Expired'}
    </span>
  );
};

const TripRequests = () => {
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryTips, setRetryTips] = useState({}); // tripId -> newTipAmount
  const [retryLoading, setRetryLoading] = useState({}); // tripId -> loadingState

  const fetchActiveTrips = async () => {
    setError('');
    try {
      const { data } = await tripAPI.getHistory();
      // Filter active states or failed/expired broadcasts (Closed status with no assigned driver)
      const active = data.filter(t => 
        ['Created', 'Requested', 'Assigned', 'On Trip'].includes(t.status) || 
        (t.status === 'Closed' && !t.driver)
      );
      setActiveTrips(active);
    } catch (err) {
      setError('Failed to load trip requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTrips();
    
    // Auto refresh every 5 seconds for simulation demonstration!
    const interval = setInterval(fetchActiveTrips, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async (trip) => {
    const newTip = retryTips[trip._id] || 0;
    if (newTip <= trip.tip) {
      alert(`Please enter a tip higher than the previous tip (₹${trip.tip}) to incentivize drivers.`);
      return;
    }

    setRetryLoading(prev => ({ ...prev, [trip._id]: true }));
    try {
      // Create a new request using matching criteria stored in the failed trip
      await tripAPI.createRequest({
        source: trip.source,
        destination: trip.destination,
        serviceType: trip.serviceTypePreference || 'Customer Car',
        vehicleSkill: trip.vehicleSkillPreference || 'Both',
        minRating: trip.minRatingPreference || '',
        genderPreference: trip.genderPreference || 'Any',
        scheduledTime: trip.scheduledTime || null,
        tip: newTip
      });

      // Update former trip status to completed/history or let it remain Closed
      // Refresh list to pull latest active trip
      await fetchActiveTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to retry booking.');
    } finally {
      setRetryLoading(prev => ({ ...prev, [trip._id]: false }));
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Active Bookings</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track live driver accepts and trip progress</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchActiveTrips}>
          <RefreshCw size={14} style={{ marginRight: '4px' }} /> Refresh
        </button>
      </div>

      {loading && activeTrips.length === 0 ? (
        <p>Loading booking details...</p>
      ) : activeTrips.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 40px' }}>
          <Compass size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No Active Requests</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            You don't have any pending driver broadcasts or current trips running.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeTrips.map((trip) => {
            const isClosedFailed = trip.status === 'Closed' && !trip.driver;
            
            return (
              <div key={trip._id} className="card card-premium" style={{ borderColor: isClosedFailed ? 'var(--danger)' : 'var(--info)' }}>
                <div className="flex justify-between items-start" style={{ marginBottom: '20px' }}>
                  <div>
                    <span className={`badge badge-${isClosedFailed ? 'rejected' : trip.status.toLowerCase()}`}>
                      {isClosedFailed ? 'Broadcast Failed' : trip.status === 'Requested' ? 'Broadcasting Requests' : trip.status}
                    </span>
                    
                    {/* Live Expiry Timer */}
                    {trip.status === 'Requested' && trip.tripRequest?.expiresAt && (
                      <div style={{ marginTop: '8px' }}>
                        <ExpiryTimer expiresAt={trip.tripRequest.expiresAt} onExpire={fetchActiveTrips} />
                      </div>
                    )}

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      ID: {trip._id} • Created on {new Date(trip.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Locked Fare</span>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                      ₹{trip.totalFare}
                    </p>
                    {trip.tip > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'block' }}>
                        (Includes ₹{trip.tip} tip)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
                  {/* Route detail */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Route Details
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} color="var(--primary-color)" />
                      <span style={{ fontSize: '0.95rem' }}>{trip.source.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={16} color="var(--success)" />
                      <span style={{ fontSize: '0.95rem' }}>{trip.destination.name}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Total Distance: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{trip.distance} km</span>
                    </p>
                    {trip.scheduledTime && (
                      <div className="flex items-center gap-1 mt-3" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                        <Calendar size={14} /> Scheduled departure: {new Date(trip.scheduledTime).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Driver status */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Driver Assignment
                    </h4>
                    {isClosedFailed ? (
                      <div className="flex items-center gap-2 text-sm text-red-500" style={{ color: 'var(--danger)' }}>
                        <AlertCircle size={18} />
                        <span>All drivers rejected, request expired, or no matches found.</span>
                      </div>
                    ) : trip.status === 'Requested' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2.5px solid var(--border-color)',
                          borderTop: '2.5px solid var(--primary-color)',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                          Awaiting acceptance from matching drivers...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        {trip.driver ? (
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>{trip.driver.name}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone: {trip.driver.phone}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email: {trip.driver.email}</p>
                            {trip.driverProfile && (
                              <div className="flex items-center gap-1 mt-1">
                                <RatingStars rating={trip.driverProfile.averageRating} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  ({trip.driverProfile.completedTrips} trips completed)
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p style={{ color: 'var(--text-muted)' }}>Driver data loading...</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Increase Tip & Retry form */}
                {isClosedFailed && (
                  <div style={{
                    background: 'var(--bg-app)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} color="var(--success)" />
                      <span className="font-semibold" style={{ fontSize: '0.95rem' }}>Increase Tip & Retry</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Increase your incentive to motivate matching drivers. Previous tip was ₹{trip.tip}.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <span style={{ fontWeight: 600 }}>₹</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder={`Higher than ₹${trip.tip}`}
                          style={{ padding: '8px 12px' }}
                          value={retryTips[trip._id] || ''}
                          onChange={(e) => setRetryTips(prev => ({ ...prev, [trip._id]: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={retryLoading[trip._id]}
                        onClick={() => handleRetry(trip)}
                        style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
                      >
                        <Send size={14} /> {retryLoading[trip._id] ? 'Retrying...' : 'Retry Broadcast'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Status workflow info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <AlertCircle size={16} />
                  <span>
                    {isClosedFailed && 'Retry this booking request by increasing the tip above.'}
                    {trip.status === 'Requested' && 'First matching driver to accept takes the booking. Others auto-cancel.'}
                    {trip.status === 'Assigned' && 'The driver has accepted your trip and is heading to your pickup location.'}
                    {trip.status === 'On Trip' && 'You are currently on the trip! Safe travels.'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TripRequests;
