import React, { useEffect } from 'react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'btn-danger'
}) => {
  useEffect(() => {
    // Prevent body scrolling when dialog is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Clean up on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // Close dialog when clicking overlay (outside dialog content)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="dialog-content" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-header">
          <h2 id="dialog-title" className="dialog-title">{title}</h2>
        </div>
        
        <div className="dialog-message">
          <p>{message}</p>
        </div>
        
        <div className="dialog-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button 
            className={`btn ${confirmButtonClass}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 