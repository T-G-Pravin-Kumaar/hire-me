import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import RatingStars from '../../components/RatingStars';
import { Check, X, Shield, Eye, Trash2 } from 'lucide-react';

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState(''); // '' (all), 'Pending', 'Verified', 'Rejected'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal for previewing documents
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDrivers = async () => {
    try {
      const { data } = await adminAPI.getDrivers({ status: filter || undefined });
      setDrivers(data);
    } catch (err) {
      setError('Failed to fetch driver logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [filter]);

  const handleUpdateDriverSettings = async (driverId, payload) => {
    setError('');
    try {
      await adminAPI.verifyDriver(driverId, payload);
      await fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Setting update failed');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this driver? All profile details will be permanently wiped.')) return;
    setError('');
    try {
      await adminAPI.deleteUser(userId);
      await fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ position: 'relative' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Driver Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Review driver profile credentials, verify licenses, and manage accounts</p>
        </div>
        
        {/* Status filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['', 'Pending', 'Verified', 'Rejected'].map((status) => (
            <button
              key={status}
              className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setFilter(status); setLoading(true); }}
            >
              {status === '' ? 'All' : status}
            </button>
          ))}
        </div>
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
        <p>Loading driver list...</p>
      ) : drivers.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <Shield size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No drivers found matching this status filter.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Driver Info</th>
                <th>License Details</th>
                <th>Skills & Services</th>
                <th>Eligibility & Duty</th>
                <th>Completed Trips</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((drv) => (
                <tr key={drv._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={drv.profilePhoto}
                        alt={drv.user?.name}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <span style={{ fontWeight: 600, display: 'block' }}>{drv.user?.name || 'User Deleted'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{drv.user?.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{drv.licenseNumber}</span>
                      <button
                        onClick={() => setPreviewDoc(drv.licenseDocument)}
                        className="btn btn-secondary btn-sm flex items-center gap-1 mt-1"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                      >
                        <Eye size={12} /> View License
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div>Skill: <span className="font-semibold">{drv.vehicleSkill}</span></div>
                      <div>Type: <span className="font-semibold">{drv.serviceType}</span></div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div>Status: <span className="font-semibold">{drv.eligibility || 'Eligible'}</span></div>
                      <div style={{ marginTop: '4px' }}>
                        Duty: <span className={`badge badge-${drv.availability.toLowerCase()}`}>{drv.availability}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600 }}>{drv.completedTrips} trips</span>
                      <RatingStars rating={drv.averageRating} />
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${drv.status.toLowerCase()}`}>{drv.status}</span>
                  </td>
                  <td>
                    <div className="flex gap-2" style={{ flexWrap: 'wrap', maxWidth: '280px' }}>
                      {drv.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateDriverSettings(drv._id, { status: 'Verified' })}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 12px', backgroundColor: 'var(--success)', color: '#fff', border: 'none' }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateDriverSettings(drv._id, { status: 'Rejected' })}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '6px 12px' }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}

                      {drv.status === 'Verified' && (
                        <div className="flex gap-1" style={{ alignItems: 'center' }}>
                          <select
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: '0.8rem', width: '110px', height: '32px' }}
                            value={drv.eligibility || 'Eligible'}
                            onChange={(e) => handleUpdateDriverSettings(drv._id, { eligibility: e.target.value })}
                          >
                            <option value="Eligible">Eligible</option>
                            <option value="Probation">Probation</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Removed">Removed</option>
                          </select>

                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: 'var(--warning)', color: 'var(--warning)', height: '32px' }}
                            disabled={drv.availability === 'Resting'}
                            onClick={() => handleUpdateDriverSettings(drv._id, { availability: 'Resting' })}
                          >
                            Enforce Rest
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleDelete(drv.user?._id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px 10px', backgroundColor: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', boxShadow: 'none' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Preview Lightbox Modal */}
      {previewDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setPreviewDoc(null)}>
          <div className="card" style={{ maxWidth: '600px', width: '90%', padding: '16px', backgroundColor: 'var(--bg-app)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>License Document Audit</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setPreviewDoc(null)}><X size={16} /></button>
            </div>
            <img
              src={previewDoc}
              alt="License Document Preview"
              style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDrivers;
