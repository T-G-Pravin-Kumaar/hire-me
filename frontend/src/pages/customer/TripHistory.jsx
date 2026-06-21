import React, { useState, useEffect } from 'react';
import { tripAPI, reviewAPI } from '../../services/api';
import RatingStars from '../../components/RatingStars';
import { History, Star, Edit, AlertCircle, Check, X } from 'lucide-react';

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    tripId: '',
    driverName: '',
    rating: 5,
    reviewText: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchTrips = async () => {
    try {
      const { data } = await tripAPI.getHistory();
      setTrips(data);
    } catch (err) {
      setError('Failed to fetch trip history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const openReviewModal = (trip) => {
    setReviewForm({
      tripId: trip._id,
      driverName: trip.driver?.name || 'Driver',
      rating: 5,
      reviewText: ''
    });
    setSubmitError('');
    setSubmitSuccess('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!reviewForm.reviewText.trim()) {
      setSubmitError('Please enter a review description');
      return;
    }

    try {
      await reviewAPI.submitReview({
        tripId: reviewForm.tripId,
        rating: reviewForm.rating,
        review: reviewForm.reviewText
      });
      setSubmitSuccess('Review submitted successfully!');
      setTimeout(() => {
        setShowReviewModal(false);
        fetchTrips();
      }, 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ position: 'relative' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Trip History</h2>
        <p style={{ color: 'var(--text-secondary)' }}>View your past rides and manage reviews</p>
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
        <p>Loading trip list...</p>
      ) : trips.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 40px' }}>
          <History size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No Trips Recorded</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't completed any trips on this platform yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Trip Details</th>
                <th>Driver</th>
                <th>Distance & Route</th>
                <th>Fare Paid</th>
                <th>Status</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip._id}>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>ID: {trip._id.slice(-6)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    {trip.driver ? (
                      <div>
                        <span style={{ fontWeight: 600 }}>{trip.driver.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{trip.driver.phone}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div><span style={{ color: 'var(--primary-color)' }}>●</span> {trip.source.name}</div>
                      <div><span style={{ color: 'var(--success)' }}>●</span> {trip.destination.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Distance: {trip.distance} km</div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{trip.totalFare}</td>
                  <td>
                    <span className={`badge badge-${trip.status.toLowerCase()}`}>{trip.status}</span>
                  </td>
                  <td>
                    {trip.status === 'Completed' ? (
                      trip.review ? (
                        <div>
                          <RatingStars rating={trip.review.rating} />
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '4px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{trip.review.review}"
                          </p>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm flex items-center gap-1"
                          onClick={() => openReviewModal(trip)}
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <Star size={12} /> Rate Driver
                        </button>
                      )
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal popup */}
      {showReviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '28px', backgroundColor: 'var(--bg-app)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Submit Driver Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {submitError && (
              <div style={{
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}>
                <AlertCircle size={14} style={{ marginRight: '6px', display: 'inline' }} />
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div style={{
                backgroundColor: 'var(--success-light)',
                color: 'var(--success)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}>
                <Check size={14} style={{ marginRight: '6px', display: 'inline' }} />
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Driver:</span>
                <p style={{ fontSize: '1rem', fontWeight: 600 }}>{reviewForm.driverName}</p>
              </div>

              {/* Rating Star selector */}
              <div className="form-group">
                <label className="form-label">Score (1-5 Stars)</label>
                <div style={{ display: 'flex', gap: '8px', fontSize: '1.5rem', color: 'var(--warning)', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                    >
                      {star <= reviewForm.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Review Comment</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Share details of your experience driving with this driver..."
                  value={reviewForm.reviewText}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TripHistory;
