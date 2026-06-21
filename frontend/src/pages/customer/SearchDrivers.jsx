import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import MapSimulator from '../../components/MapSimulator';
import { MapPin, Sliders, Car, Calendar, DollarSign, Users, Award, Shield, Check } from 'lucide-react';

const PRESET_LOCATIONS = [
  { name: 'Majestic Bus Station', lat: 12.9779, lng: 77.5707 },
  { name: 'Kempegowda International Airport', lat: 13.1986, lng: 77.7066 },
  { name: 'Indiranagar Metro Station', lat: 12.9719, lng: 77.6412 },
  { name: 'Whitefield Central', lat: 12.9698, lng: 77.7500 },
  { name: 'Electronic City Phase 1', lat: 12.8399, lng: 77.6770 }
];

const SearchDrivers = () => {
  const [sourceIndex, setSourceIndex] = useState('0');
  const [destIndex, setDestIndex] = useState('1');
  
  // Clean modern UX states instead of dropdowns
  const [ownVehicle, setOwnVehicle] = useState(true); // true => Customer Car, false => Own Car (driver vehicle)
  const [transmission, setTransmission] = useState('Both'); // 'Manual' | 'Automatic' | 'Both'
  const [ratingPref, setRatingPref] = useState('Any'); // 'Any' | '4.0' | '4.5'
  const [genderPref, setGenderPref] = useState('Any'); // 'Any' | 'Male' | 'Female'
  
  // Advance scheduling & tip states
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [tip, setTip] = useState(0);

  const [fareEstimate, setFareEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const activeSource = PRESET_LOCATIONS[parseInt(sourceIndex)];
  const activeDest = PRESET_LOCATIONS[parseInt(destIndex)];

  const calculateEstimate = async () => {
    if (sourceIndex === destIndex) {
      setFareEstimate(null);
      return;
    }
    try {
      const { data } = await tripAPI.calculateFare({
        source: activeSource,
        destination: activeDest
      });
      setFareEstimate(data);
    } catch (err) {
      console.error('Failed to load fare estimate:', err);
    }
  };

  useEffect(() => {
    calculateEstimate();
  }, [sourceIndex, destIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (sourceIndex === destIndex) {
      setError('Pickup and Drop-off locations cannot be the same.');
      return;
    }

    if (isScheduled && !scheduledTime) {
      setError('Please select a date and time for the advanced scheduling.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        source: activeSource,
        destination: activeDest,
        serviceType: ownVehicle ? 'Customer Car' : 'Own Car',
        vehicleSkill: transmission,
        minRating: ratingPref === 'Any' ? '' : ratingPref,
        genderPreference: genderPref,
        scheduledTime: isScheduled ? scheduledTime : null,
        tip: tip
      };

      await tripAPI.createRequest(payload);
      navigate('/customer/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Book a Verified Driver</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Enter your route and driver criteria. Our matching algorithm automatically dispatches invitations to verified drivers.
        </p>
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
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Side: Route and Matching options */}
        <div className="dashboard-main" style={{ gridColumn: 'span 7' }}>
          <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="var(--primary-color)" /> Ride Requirements
            </h3>

            {/* Source & Destination */}
            <div className="grid grid-2" style={{ gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="var(--primary-color)" /> Pickup Location
                </label>
                <select
                  className="form-control"
                  value={sourceIndex}
                  onChange={(e) => setSourceIndex(e.target.value)}
                >
                  {PRESET_LOCATIONS.map((loc, i) => (
                    <option key={i} value={i}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="var(--success)" /> Drop-off Location
                </label>
                <select
                  className="form-control"
                  value={destIndex}
                  onChange={(e) => setDestIndex(e.target.value)}
                >
                  {PRESET_LOCATIONS.map((loc, i) => (
                    <option key={i} value={i}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Own Vehicle Toggle (Cleaner Switch UX) */}
            <div className="flex items-center justify-between" style={{
              background: 'var(--bg-app)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>Do you own the vehicle?</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {ownVehicle ? 'Driver will drive your personal car.' : "Driver will bring their own vehicle (Cab service)."}
                </span>
              </div>
              <div style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                <input
                  type="checkbox"
                  checked={ownVehicle}
                  onChange={(e) => setOwnVehicle(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                  id="vehicle-toggle"
                />
                <label
                  htmlFor="vehicle-toggle"
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: ownVehicle ? 'var(--primary-color)' : '#ccc',
                    borderRadius: '34px',
                    transition: '.3s'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '20px',
                    width: '20px',
                    left: ownVehicle ? '26px' : '4px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '.3s'
                  }} />
                </label>
              </div>
            </div>

            {/* Transmission Skill Preferences (Modern pills) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Car size={14} /> Transmission Preference
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Both', 'Manual', 'Automatic'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`btn btn-sm ${transmission === t ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setTransmission(t)}
                  >
                    {t === 'Both' ? 'Either Skill' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Rating Preference (Pills / Stars UX) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={14} /> Driver Rating Preference
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Any', '4.0', '4.5'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`btn btn-sm ${ratingPref === r ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setRatingPref(r)}
                  >
                    {r === 'Any' ? 'Any Rating' : `${r}★ or above`}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Preference (Modern Pills selector) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={14} /> Driver Gender Preference
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Any', 'Male', 'Female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`btn btn-sm ${genderPref === g ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setGenderPref(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Date/Time Scheduling & Tipping */}
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Advance Booking scheduling */}
              <div className="flex items-center justify-between">
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>Schedule Trip in Advance?</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Book ahead for scheduled departure date and time.
                  </span>
                </div>
                <div style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                    id="schedule-toggle"
                  />
                  <label
                    htmlFor="schedule-toggle"
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: isScheduled ? 'var(--primary-color)' : '#ccc',
                      borderRadius: '34px',
                      transition: '.3s'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '20px',
                      width: '20px',
                      left: isScheduled ? '26px' : '4px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '.3s'
                    }} />
                  </label>
                </div>
              </div>

              {isScheduled && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={scheduledTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Tipping */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={14} /> Add Incentive / Driver Tip
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>₹</span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 50"
                    min="0"
                    value={tip}
                    onChange={(e) => setTip(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Adding a tip makes your broadcast highly appealing to nearby matching drivers!
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ padding: '14px' }} disabled={loading}>
              {loading ? 'Finding & Dispatched...' : <><Shield size={16} /> Match & Book Driver</>}
            </button>
          </form>
        </div>

        {/* Right Side: Map & Live estimation card */}
        <div className="dashboard-sidebar" style={{ gridColumn: 'span 5' }}>
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontSize: '1.15rem' }}>Route Simulation</h3>
              <MapSimulator
                source={activeSource}
                destination={activeDest}
                height={260}
              />
            </div>

            {fareEstimate && (
              <div className="card card-premium">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Fare Estimates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="flex justify-between" style={{ fontSize: '0.9rem' }}>
                    <span>Estimated Distance:</span>
                    <span className="font-semibold">{fareEstimate.distance} km</span>
                  </div>
                  <div className="flex justify-between" style={{ fontSize: '0.9rem' }}>
                    <span>Base Fare (₹8/km):</span>
                    <span className="font-semibold">₹{fareEstimate.tripFare}</span>
                  </div>
                  {tip > 0 && (
                    <div className="flex justify-between" style={{ fontSize: '0.9rem', color: 'var(--success)' }}>
                      <span>Added Incentive/Tip:</span>
                      <span className="font-semibold">+ ₹{tip}</span>
                    </div>
                  )}
                  <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                  <div className="flex justify-between" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    <span>Estimated Cost:</span>
                    <span>₹{(parseFloat(fareEstimate.tripFare) + tip).toFixed(2)}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    * Driver return compensation (₹1/km from drop-off to driver home base) will be computed transparently and locked in when a driver accepts.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDrivers;
