import React from 'react';
import { Link } from 'react-router-dom';

const RecentTripsCard = ({ trips }) => {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">Recent Trips</h3>
        <Link to="/trip-history" className="btn btn-secondary">
          View All
        </Link>
      </div>
      
      {trips.length === 0 ? (
        <p>No recent trips found.</p>
      ) : (
        <div className="recent-trips">
          {trips.slice(0, 3).map(trip => (
            <div key={trip._id || trip.id} className="trip-item">
              <div className="trip-details">
                <div className="trip-route">
                  <span>{trip.source?.name || trip.sourceLocation?.name || 'Unknown'}</span>
                  <span> → </span>
                  <span>{trip.destination?.name || trip.destinationLocation?.name || 'Unknown'}</span>
                </div>
                <div className="trip-date">{new Date(trip.travelDate || trip.date).toLocaleDateString()}</div>
              </div>
              <div className="trip-status">
                <span className={`status-badge ${trip.status.toLowerCase()}`}>
                  {trip.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTripsCard;