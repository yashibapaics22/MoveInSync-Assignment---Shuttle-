import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="card bg-light">
      <h1 className="text-primary text-center">
        <i className="fas fa-exclamation-triangle"></i> Unauthorized Access
      </h1>
      <div className="my-3 p-3">
        <div className="alert alert-danger">
          <p>You do not have permission to access this page. Administrator privileges are required.</p>
        </div>
        <p className="lead">
          This area is restricted to administrators only. If you believe you should have access,
          please contact the system administrator.
        </p>
        <div className="text-center my-3">
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home"></i> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 