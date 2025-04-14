import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingContext from '../../context/booking/bookingContext';
import BookingItem from './BookingItem';
import Spinner from '../layout/Spinner';

const MyBookings = () => {
  const bookingContext = useContext(BookingContext);
  const { bookings, getBookings, loading, error } = bookingContext;
  
  const [filteredBookings, setFilteredBookings] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  // Initial loading of bookings
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadingMessage('Loading your bookings...');
      
      try {
        console.log('MyBookings: Getting bookings data');
        await getBookings();
        console.log('MyBookings: Bookings loaded successfully');
      } catch (error) {
        console.error('MyBookings: Error loading bookings', error);
        setLoadingMessage('Failed to load bookings. Please refresh the page.');
      } finally {
        // Allow spinner to show for at least 500ms for better UX
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    loadData();
    // eslint-disable-next-line
  }, []);

  // Update filtered bookings whenever bookings, filter or sort changes
  useEffect(() => {
    if (bookings) {
      console.log('MyBookings: Filtering bookings, total count:', bookings.length);
      
      // Make a copy of the bookings array to avoid mutating the original
      let filtered = [...bookings];
      
      // Apply status filter
      if (filterStatus !== 'all') {
        filtered = filtered.filter(booking => booking.status === filterStatus);
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        // First check if both items have dates
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        
        // Then try to parse the dates
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Check for valid dates
        const isDateAValid = !isNaN(dateA.getTime());
        const isDateBValid = !isNaN(dateB.getTime());
        
        if (!isDateAValid && !isDateBValid) return 0;
        if (!isDateAValid) return 1;
        if (!isDateBValid) return -1;
        
        // Finally, sort based on valid dates
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
      
      setFilteredBookings(filtered);
    }
  }, [bookings, filterStatus, sortOrder]);

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Manual refresh function for users
  const handleRefresh = async () => {
    setIsLoading(true);
    setLoadingMessage('Refreshing bookings...');
    
    try {
      await getBookings();
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="card bg-light text-center">
        <h2 className="text-primary">My Bookings</h2>
        <p>{loadingMessage}</p>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-light">
        <h2 className="text-primary text-center">My Bookings</h2>
        <div className="alert alert-danger">{error}</div>
        <div className="text-center">
          <button onClick={handleRefresh} className="btn btn-dark">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="card bg-light">
        <h2 className="text-primary text-center">My Bookings</h2>
        <p className="text-center lead">You have no bookings yet</p>
        <div className="text-center p-1">
          <Link to="/bookings/new" className="btn btn-primary">
            Book a Shuttle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">My Bookings</h2>
      
      <div className="grid-2 my-2">
        <div className="form-group">
          <label htmlFor="filter">Filter by Status:</label>
          <select
            name="filter"
            value={filterStatus}
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="sort">Sort by Date:</label>
          <select
            name="sort"
            value={sortOrder}
            onChange={handleSortChange}
            className="form-control"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
      
      <div className="my-1 text-right">
        <button onClick={handleRefresh} className="btn btn-dark btn-sm">
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>
      
      {filteredBookings && filteredBookings.length > 0 ? (
        <>
          <div className="booking-count my-2">
            <p className="text-center">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </p>
          </div>
          
          {filteredBookings.map(booking => (
            <BookingItem key={booking._id} booking={booking} />
          ))}
        </>
      ) : (
        <p className="text-center lead">No bookings match your filter criteria</p>
      )}
      
      <div className="text-center p-1">
        <Link to="/bookings/new" className="btn btn-primary">
          Book a New Shuttle
        </Link>
      </div>
    </div>
  );
};

export default MyBookings; 