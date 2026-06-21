import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { driverAPI } from '../../services/api';
import RatingStars from '../../components/RatingStars';
import ReviewCard from '../../components/ReviewCard';
import { Shield, Sparkles, MapPin, CheckCircle, Save, AlertCircle } from 'lucide-react';

const PRESET_LOCATIONS = [
  { name: 'Majestic Bus Station', lat: 12.9779, lng: 77.5707 },
  { name: 'Kempegowda International Airport', lat: 13.1986, lng: 77.7066 },
  { name: 'Indiranagar Metro Station', lat: 12.9719, lng: 77.6412 },
  { name: 'Whitefield Central', lat: 12.9698, lng: 77.7500 },
  { name: 'Electronic City Phase 1', lat: 12.8399, lng: 77.6770 }
];

const DriverProfile = () => {
  const { user, profile, refreshUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    vehicleSkill: 'Both',
    serviceType: 'Both',
    currentLocationIndex: '0',
    homeLocationIndex: '0'
  });
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      // Find matching preset index for locations
      const curIndex = PRESET_LOCATIONS.findIndex(l => l.name === profile.currentLocation?.name);
      const homIndex = PRESET_LOCATIONS.findIndex(l => l.name === profile.homeLocation?.name);

      setFormData({
        vehicleSkill: profile.vehicleSkill,
        serviceType: profile.serviceType,
        currentLocationIndex: curIndex !== -1 ? String(curIndex) : '0',
        homeLocationIndex: homIndex !== -1 ? String(homIndex) : '0'
      });

      // Load reviews
      const fetchReviews = async () => {
        try {
          const { data } = await driverAPI.getProfile(user._id);
          setReviews(data.reviews);
        } catch (err) {
          console.error('Failed to load reviews:', err.message);
        }
      };
      fetchReviews();
    }
  }, [profile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSaving(true);

    const curLoc = PRESET_LOCATIONS[parseInt(formData.currentLocationIndex)];
    const homLoc = PRESET_LOCATIONS[parseInt(formData.homeLocationIndex)];

    try {
      await driverAPI.updateProfile({
        vehicleSkill: formData.vehicleSkill,
        serviceType: formData.serviceType,
        currentLocation: curLoc,
        homeLocation: homLoc
      });
      setSuccess('Profile updated successfully!');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <p className="container">Loading profile...</p>;

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Profile Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your vehicle skills, operation centers, and view passenger reviews</p>
      </div>

      {success && (
        <div style={{
          backgroundColor: 'var(--success-light)',
          color: 'var(--success)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          marginBottom: '20px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
          <span>{success}</span>
        </div>
      )}

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

      <div className="dashboard-grid">
        {/* Form panel */}
        <div className="dashboard-main">
          <div className="card" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Driver Preferences</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Transmission Preference</label>
                  <select
                    name="vehicleSkill"
                    className="form-control"
                    value={formData.vehicleSkill}
                    onChange={handleInputChange}
                  >
                    <option value="Manual">Manual Transmission Only</option>
                    <option value="Automatic">Automatic Transmission Only</option>
                    <option value="Both">Both (Manual & Auto)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Service Type</label>
                  <select
                    name="serviceType"
                    className="form-control"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                  >
                    <option value="Customer Car">Customer's Personal Vehicles Only</option>
                    <option value="Own Car">Driver-provided Vehicles Only</option>
                    <option value="Both">Both Service Styles</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Current Standby Location</label>
                  <select
                    name="currentLocationIndex"
                    className="form-control"
                    value={formData.currentLocationIndex}
                    onChange={handleInputChange}
                  >
                    {PRESET_LOCATIONS.map((loc, i) => (
                      <option key={i} value={i}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Home Base Location</label>
                  <select
                    name="homeLocationIndex"
                    className="form-control"
                    value={formData.homeLocationIndex}
                    onChange={handleInputChange}
                  >
                    {PRESET_LOCATIONS.map((loc, i) => (
                      <option key={i} value={i}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm flex items-center gap-1" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving changes...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Passenger Review History</h3>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No customer feedback records found.</p>
            ) : (
              reviews.map(rev => <ReviewCard key={rev._id} review={rev} />)
            )}
          </div>
        </div>

        {/* Credentials detail sidebar */}
        <div className="dashboard-sidebar">
          <div className="card card-premium" style={{ marginBottom: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img
                src={profile.profilePhoto}
                alt={user.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }}
              />
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '12px' }}>{user.name}</h4>
              <RatingStars rating={profile.averageRating} />
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '12px' }} className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Verification Status:</span>
                <span className={`badge badge-${profile.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{profile.status}</span>
              </div>
              <div style={{ marginBottom: '12px' }} className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>License Number:</span>
                <span style={{ fontWeight: 600 }}>{profile.licenseNumber}</span>
              </div>
              <div style={{ marginBottom: '12px' }} className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Date of Birth:</span>
                <span style={{ fontWeight: 600 }}>{new Date(profile.dob).toLocaleDateString()}</span>
              </div>
              <div style={{ marginBottom: '12px' }} className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Address Base:</span>
                <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '140px', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {profile.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
