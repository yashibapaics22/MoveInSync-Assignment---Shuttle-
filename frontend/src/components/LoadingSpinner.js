import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const getSpinnerSize = () => {
    switch(size) {
      case 'small':
        return { width: '24px', height: '24px', borderWidth: '2px' };
      case 'large':
        return { width: '60px', height: '60px', borderWidth: '4px' };
      case 'medium':
      default:
        return { width: '40px', height: '40px', borderWidth: '3px' };
    }
  };
  
  const spinnerStyle = getSpinnerSize();
  
  return (
    <div className="loading-spinner">
      <div 
        className="spinner" 
        style={spinnerStyle}
        aria-label="Loading content"
      />
      {text && (
        <p className="loading-text" style={{ marginTop: '1rem', color: 'var(--text-light)' }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 