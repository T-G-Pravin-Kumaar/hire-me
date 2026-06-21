import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Trash2 } from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      const { data } = await adminAPI.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Failed to fetch customers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this customer? All profile data will be permanently wiped.')) return;
    setError('');
    
    try {
      await adminAPI.deleteUser(userId);
      await fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Customer Directory</h2>
        <p style={{ color: 'var(--text-secondary)' }}>View passenger contact registers and manage platform user credentials</p>
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
        <p>Loading passenger directory...</p>
      ) : customers.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <Users size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No customer accounts registered yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Home Address</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust._id}>
                  <td style={{ fontWeight: 600 }}>{cust.user?.name || 'User Deleted'}</td>
                  <td>{cust.user?.email}</td>
                  <td>{cust.user?.phone}</td>
                  <td style={{ color: cust.address ? 'inherit' : 'var(--text-muted)', fontStyle: cust.address ? 'normal' : 'italic' }}>
                    {cust.address || 'Not specified'}
                  </td>
                  <td>{cust.user ? new Date(cust.user.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(cust.user?._id)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px 10px', backgroundColor: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', boxShadow: 'none' }}
                      disabled={!cust.user}
                    >
                      <Trash2 size={14} />
                    </button>
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

export default AdminCustomers;
