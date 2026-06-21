import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Calendar, MapPin, Compass } from 'lucide-react';

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await adminAPI.getTrips();
        setTrips(data);
      } catch (err) {
        setError('Failed to fetch platform trip logs');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Trips Log Audit</h2>
        <p style={{ color: 'var(--text-secondary)' }}>View and monitor all transport journeys scheduled on the platform</p>
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

      {loading ? (
        <p>Loading trips logs...</p>
      ) : trips.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <Compass size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No trips scheduled yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Rider (Customer)</th>
                <th>Driver Profile</th>
                <th>Route details</th>
                <th>Mileage</th>
                <th>Fare</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip._id}>
                  <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{trip._id.toUpperCase()}</td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600, display: 'block' }}>{trip.customer?.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.customer?.phone}</span>
                    </div>
                  </td>
                  <td>
                    {trip.driver ? (
                      <div>
                        <span style={{ fontWeight: 600, display: 'block' }}>{trip.driver.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.driver.phone}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Awaiting Assignment</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div><span style={{ color: 'var(--primary-color)' }}>●</span> {trip.source.name}</div>
                      <div><span style={{ color: 'var(--success)' }}>●</span> {trip.destination.name}</div>
                    </div>
                  </td>
                  <td>{trip.distance} km</td>
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
  );
};

export default AdminTrips;
