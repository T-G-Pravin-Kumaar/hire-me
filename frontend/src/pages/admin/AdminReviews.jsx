import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import RatingStars from '../../components/RatingStars';
import { Star, MessageSquare } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await adminAPI.getReviews();
        setReviews(data);
      } catch (err) {
        setError('Failed to fetch reviews feed');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Reviews Feed Auditing</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Audit passenger ratings, feedbacks, and safety report cards</p>
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
        <p>Loading reviews registry...</p>
      ) : reviews.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <MessageSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No review entries filed on the platform.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Passenger</th>
                <th>Driver</th>
                <th>Stars Rating</th>
                <th>Trip Details</th>
                <th>Written Review</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev._id}>
                  <td style={{ fontWeight: 600 }}>{rev.customer?.name}</td>
                  <td style={{ fontWeight: 600 }}>{rev.driver?.name}</td>
                  <td>
                    <RatingStars rating={rev.rating} />
                  </td>
                  <td>
                    {rev.trip ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {rev.trip.source.name.slice(0, 15)}... ➔ {rev.trip.destination.name.slice(0, 15)}...
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Trip Details N/A</span>
                    )}
                  </td>
                  <td style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    "{rev.review}"
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

export default AdminReviews;
