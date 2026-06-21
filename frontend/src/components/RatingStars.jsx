import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0 }) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // round to nearest 0.5
  
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      // Full Star
      stars.push(<Star key={i} size={16} fill="var(--warning)" color="var(--warning)" />);
    } else if (i - 0.5 === roundedRating) {
      // Half Star (or colored border)
      stars.push(<Star key={i} size={16} fill="url(#halfGrad)" color="var(--warning)" />);
    } else {
      // Empty Star
      stars.push(<Star key={i} size={16} color="var(--text-muted)" />);
    }
  }

  return (
    <div className="rating-stars">
      {/* SVG Gradient definition for half-filled stars */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="var(--warning)" />
            <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {stars}
      {rating > 0 && <span style={{ marginLeft: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({rating.toFixed(1)})</span>}
    </div>
  );
};

export default RatingStars;
