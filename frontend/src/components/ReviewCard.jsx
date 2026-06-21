import React from 'react';
import RatingStars from './RatingStars';

const ReviewCard = ({ review }) => {
  if (!review) return null;
  const { rating, review: text, customer, createdAt } = review;

  return (
    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{customer?.name || 'Customer'}</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
        <RatingStars rating={rating} />
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        "{text}"
      </p>
    </div>
  );
};

export default ReviewCard;
