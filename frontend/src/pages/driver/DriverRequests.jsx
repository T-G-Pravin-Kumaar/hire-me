import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import { Inbox, MapPin, Check, X, AlertCircle } from 'lucide-react';

const DriverRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const { data } = await tripAPI.getDriverRequests();
      setRequests(data);
    } catch (err) {
      setError('Failed to fetch request invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Auto polling requests every 5 seconds for demonstration
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (requestId, action) => {
    setActionLoading(true);
    setError('');

    try {
      const { data } = await tripAPI.respondToRequest(requestId, { action });
      if (action === 'accept') {
        navigate('/driver/dashboard');
      } else {
        // Remove from local list
        setRequests(prev => prev.filter(req => req._id !== requestId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
      // Refresh list to pull latest state
      fetchRequests();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Trip Invitations</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Awaiting your response. Fares include your return home compensation.</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          marginBottom: '20px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
          <span>{error}</span>
        </div>
      )}

      {loading && requests.length === 0 ? (
        <p>Checking incoming booking requests...</p>
      ) : requests.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 40px' }}>
          <Inbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Your Inbox is Empty</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No riders have requested you for active trips at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {requests.map((reqObj) => (
            <div key={reqObj._id} className="card card-premium">
              <div className="flex justify-between items-start" style={{ marginBottom: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{reqObj.trip.customer?.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Phone: {reqObj.trip.customer?.phone}
                  </span>
                </div>
                <div className="text-right">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Payout</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>
                    ₹{reqObj.trip.totalFare}
                  </p>
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
                {/* Route */}
                <div>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Route Details</h5>
                  <div className="flex items-center gap-2 mb-2" style={{ fontSize: '0.9rem' }}>
                    <MapPin size={14} color="var(--primary-color)" />
                    <span>{reqObj.trip.source.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2" style={{ fontSize: '0.9rem' }}>
                    <MapPin size={14} color="var(--success)" />
                    <span>{reqObj.trip.destination.name}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Distance: {reqObj.trip.distance} km
                  </div>
                </div>

                {/* Fare Breakdown */}
                <div>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Payout Breakdown</h5>
                  <div className="flex justify-between" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>Trip Driving (₹8/km):</span>
                    <span style={{ fontWeight: 600 }}>₹{reqObj.trip.tripFare}</span>
                  </div>
                  <div className="flex justify-between" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>Return Compensation (₹1/km):</span>
                    <span style={{ fontWeight: 600 }}>+ ₹{reqObj.trip.returnFare}</span>
                  </div>
                  <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                  <div className="flex justify-between" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    <span>Total:</span>
                    <span>₹{reqObj.trip.totalFare}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end" style={{ gap: '16px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleRespond(reqObj._id, 'reject')}
                  disabled={actionLoading}
                  style={{ border: '1px solid var(--danger)', color: 'var(--danger)' }}
                >
                  <X size={14} /> Decline
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleRespond(reqObj._id, 'accept')}
                  disabled={actionLoading}
                >
                  <Check size={14} /> Accept Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverRequests;
