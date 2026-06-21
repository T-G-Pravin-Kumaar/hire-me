import React from 'react';

const AnalyticsWidget = ({ title, value, icon, color = 'var(--primary-color)', bgColor = 'var(--primary-light)' }) => {
  return (
    <div className="card metric-card">
      <div className="metric-icon" style={{ backgroundColor: bgColor, color: color }}>
        {icon}
      </div>
      <div className="metric-info">
        <h4>{title}</h4>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
