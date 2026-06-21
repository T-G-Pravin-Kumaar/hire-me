import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';

const PRESET_LOCATIONS = [
  { name: 'Majestic Bus Station', lat: 12.9779, lng: 77.5707 },
  { name: 'Kempegowda International Airport', lat: 13.1986, lng: 77.7066 },
  { name: 'Indiranagar Metro Station', lat: 12.9719, lng: 77.6412 },
  { name: 'Whitefield Central', lat: 12.9698, lng: 77.7500 },
  { name: 'Electronic City Phase 1', lat: 12.8399, lng: 77.6770 }
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    gender: 'Male',
    
    // Customer profile specific
    customerAddress: '',
    
    // Driver profile specific
    dob: '',
    driverAddress: '',
    profilePhoto: '',
    licenseNumber: '',
    licenseDocument: '',
    currentLocationIndex: '0',
    homeLocationIndex: '0',
    vehicleSkill: 'Both',
    serviceType: 'Both'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Convert uploaded files to base64 strings
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Common validations
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all common fields');
      return;
    }

    setLoading(true);

    try {
      let registrationPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        gender: formData.gender
      };

      if (formData.role === 'customer') {
        if (!formData.customerAddress || !formData.customerAddress.trim()) {
          setError('Home Address is required');
          setLoading(false);
          return;
        }
        registrationPayload.address = formData.customerAddress;
      } else {
        // Driver specific validation
        if (!formData.dob || !formData.driverAddress || !formData.licenseNumber) {
          setError('Please fill in all driver profile details');
          setLoading(false);
          return;
        }

        // Age check
        const ageDiffMs = Date.now() - new Date(formData.dob).getTime();
        const ageDate = new Date(ageDiffMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (age < 18) {
          setError('Drivers must be at least 18 years old to register');
          setLoading(false);
          return;
        }

        // Location lookup
        const curLoc = PRESET_LOCATIONS[parseInt(formData.currentLocationIndex)];
        const homLoc = PRESET_LOCATIONS[parseInt(formData.homeLocationIndex)];

        // Document fallbacks if not uploaded (using beautiful avatars/placeholders)
        const photoFallback = formData.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
        const licenseFallback = formData.licenseDocument || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=300&auto=format&fit=crop';

        registrationPayload = {
          ...registrationPayload,
          dob: formData.dob,
          address: formData.driverAddress,
          profilePhoto: photoFallback,
          licenseNumber: formData.licenseNumber,
          licenseDocument: licenseFallback,
          currentLocation: curLoc,
          homeLocation: homLoc,
          vehicleSkill: formData.vehicleSkill,
          serviceType: formData.serviceType
        };
      }

      await register(registrationPayload);
      navigate(`/${formData.role}/dashboard`);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '40px 0' }}>
      <div className="card" style={{ width: '100%', maxWidth: formData.role === 'driver' ? '800px' : '500px', padding: '32px' }}>
        <div className="text-center" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Register to join the Hire Me platform
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector buttons */}
          <div className="form-group">
            <label className="form-label">I want to register as a:</label>
            <div className="grid grid-2">
              <button
                type="button"
                className={`btn ${formData.role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
              >
                Customer (Hire Drivers)
              </button>
              <button
                type="button"
                className={`btn ${formData.role === 'driver' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'driver' }))}
              >
                Driver (Get Hired)
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: formData.role === 'driver' ? '1fr 1fr' : '1fr',
            gap: '24px'
          }}>
            {/* Common Section */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Account Information
              </h3>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Rohan Sharma"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="e.g. rohan@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="e.g. 9123456780"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.role === 'customer' && (
                <div className="form-group">
                  <label className="form-label">Home Address</label>
                  <input
                    type="text"
                    name="customerAddress"
                    className="form-control"
                    placeholder="e.g. Indiranagar, Bengaluru"
                    value={formData.customerAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
            </div>

            {/* Driver Profile Specific Section */}
            {formData.role === 'driver' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  Driver Credentials
                </h3>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Address</label>
                  <input
                    type="text"
                    name="driverAddress"
                    className="form-control"
                    placeholder="Residential address"
                    value={formData.driverAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="form-control"
                    placeholder="e.g. KA-01-2015-00000"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Current Location</label>
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
                    <label className="form-label">Home Base</label>
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

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Driving Skill</label>
                    <select
                      name="vehicleSkill"
                      className="form-control"
                      value={formData.vehicleSkill}
                      onChange={handleInputChange}
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Both">Both (Manual & Auto)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Offered</label>
                    <select
                      name="serviceType"
                      className="form-control"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                    >
                      <option value="Customer Car">Customer's Car</option>
                      <option value="Own Car">Driver's Vehicle</option>
                      <option value="Both">Both Services</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Profile Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => handleFileChange(e, 'profilePhoto')}
                      style={{ fontSize: '0.8rem', padding: '8px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License Document</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => handleFileChange(e, 'licenseDocument')}
                      style={{ fontSize: '0.8rem', padding: '8px' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ padding: '14px', marginTop: '20px' }}
          >
            {loading ? 'Processing Registration...' : <><UserPlus size={18} /> Register Account</>}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '24px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontBold: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
