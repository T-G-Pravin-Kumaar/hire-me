import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { driverAPI } from '../../services/api';
import RatingStars from '../../components/RatingStars';
import ReviewCard from '../../components/ReviewCard';
import { ArrowLeft, Car, Star, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

const DriverProfileView = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profileData } = await driverAPI.getProfile(id);
        setData(profileData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load driver profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="container text-center" style={{ padding: '80px 0' }}>
        <p>Loading profile details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container text-center" style={{ padding: '80px 0' }}>
        <p style={{ color: 'var(--danger)' }}>{error || 'Profile not found'}</p>
        <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const { driver, reviews } = data;

  return (
    <div className="container animate-fade-in">
      <button className="btn btn-secondary btn-sm mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="dashboard-grid">
        {/* Main Info */}
        <div className="dashboard-main">
          {/* Header Card */}
          <div className="card card-premium" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <img
                src={driver.profilePhoto}
                alt={driver.user?.name}
                style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
              />
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2">
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{driver.user?.name}</h2>
                  <span className={`badge badge-${driver.status.toLowerCase()}`}>
                    <ShieldCheck size={14} style={{ marginRight: '4px' }} /> {driver.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <RatingStars rating={driver.averageRating} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    • {driver.completedTrips} Trips completed
                  </span>
                </div>
                <div className="flex gap-4 mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-1"><Phone size={14} /> {driver.user?.phone}</div>
                  <div className="flex items-center gap-1"><Mail size={14} /> {driver.user?.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Preferences & Base</h3>
            <div className="grid grid-2" style={{ gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transmission Skill</span>
                <p style={{ fontWeight: 600, fontSize: '1.05rem', margin: '4px 0 12px' }}>{driver.vehicleSkill}</p>
                
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Service Offered</span>
                <p style={{ fontWeight: 600, fontSize: '1.05rem', margin: '4px 0 12px' }}>{driver.serviceType}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} color="var(--primary-color)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Location</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{driver.currentLocation.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin size={16} color="var(--warning)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Home Base</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{driver.homeLocation.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Public Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reviews submitted for this driver yet.</p>
            ) : (
              reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))
            )}
          </div>
        </div>

        {/* Status widget sidebar */}
        <div className="dashboard-sidebar">
          <div className="card text-center" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>Driver Status</span>
            <div style={{ margin: '16px 0' }}>
              <span className={`badge badge-${driver.availability.toLowerCase()}`} style={{ fontSize: '1rem', padding: '6px 16px' }}>
                {driver.availability}
              </span>
            </div>
            {driver.availability === 'Resting' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                This driver is currently in an 8-hour resting window to prevent fatigue.
              </p>
            )}
            {driver.availability === 'Available' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Verified and ready to receive requests.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfileView;
