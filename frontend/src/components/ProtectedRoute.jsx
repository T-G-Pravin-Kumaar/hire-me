import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-heading)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid var(--border-color)',
          borderTop: '4px solid var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Loading secure session...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect role to their respective home dashboard
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;
