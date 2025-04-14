import React, { useState, useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import BookingContext from '../../context/booking/bookingContext';
import RouteContext from '../../context/route/routeContext';
import AlertContext from '../../context/alert/alertContext';
import Spinner from '../layout/Spinner';

const BookingForm = () => {
  const history = useHistory();
  const location = useLocation();
  const bookingContext = useContext(BookingContext);
  const routeContext = useContext(RouteContext);
  const alertContext = useContext(AlertContext);

  const { addBooking, error: bookingError } = bookingContext;
  const { routes, getRoutes, loading, error: routeError } = routeContext;
  const { setAlert } = alertContext;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        await getRoutes();
        console.log('Routes loaded successfully');
      } catch (err) {
        console.error('Failed to load routes:', err);
      }
    };
    
    loadRoutes();
    // eslint-disable-next-line
  }, []);
  
  // Check URL for route selection
  useEffect(() => {
    // Parse URL query parameters
    const params = new URLSearchParams(location.search);
    const routeId = params.get('route');
    
    if (routeId && routes) {
      // If route is specified in URL and routes are loaded, update route selection
      const routeExists = routes.some(r => r._id === routeId);
      if (routeExists) {
        setBooking(prev => ({ ...prev, route: routeId }));
        calculatePrice(routeId, passengers);
      }
    }
    // eslint-disable-next-line
  }, [location.search, routes]);

  // Show any errors from context
  useEffect(() => {
    if (bookingError) {
      setAlert(bookingError, 'danger');
      setIsSubmitting(false);
    }
    if (routeError) {
      setAlert(routeError, 'danger');
    }
    // eslint-disable-next-line
  }, [bookingError, routeError]);

  const [booking, setBooking] = useState({
    route: '',
    date: '',
    time: '',
    passengers: 1
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const { route, date, time, passengers } = booking;

  const onChange = e => {
    const { name, value } = e.target;
    setBooking({ ...booking, [name]: value });

    // Calculate price when route or passengers change
    if (name === 'route' || name === 'passengers') {
      calculatePrice(name === 'route' ? value : route, name === 'passengers' ? value : passengers);
    }
  };

  const calculatePrice = (routeId, passengerCount) => {
    if (!routeId || !passengerCount || !routes) return;

    const selectedRoute = routes.find(r => r._id === routeId);
    if (selectedRoute) {
      const price = selectedRoute.price * parseInt(passengerCount);
      setCalculatedPrice(price);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (route === '' || date === '' || time === '' || passengers === '') {
      setAlert('Please fill in all fields', 'danger');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Creating booking with data:', {
        route,
        date,
        time,
        passengers: parseInt(passengers),
        totalPrice: calculatedPrice
      });
      
      // Format booking data
      const bookingData = {
        route,
        date,
        time,
        passengers: parseInt(passengers),
        totalPrice: calculatedPrice
      };

      const newBooking = await addBooking(bookingData);
      console.log('Booking created:', newBooking);
      
      setAlert('Booking created successfully', 'success');
      
      // Redirect to my bookings page
      history.push('/bookings/my-bookings');
    } catch (err) {
      console.error('Error creating booking:', err);
      setAlert('Failed to create booking. Please try again.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return `${year}-${month}-${day}`;
  };

  if (loading || !routes) {
    return (
      <div className="card bg-light text-center">
        <h2 className="text-primary">Book a Shuttle</h2>
        <p>Loading available routes...</p>
        <Spinner />
      </div>
    );
  }

  // Check if routes data is valid
  if (routes.length === 0) {
    return (
      <div className="card bg-light">
        <h2 className="text-primary text-center">Book a Shuttle</h2>
        <p className="text-center">No routes are available currently. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">Book a Shuttle</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="route">Select Route</label>
          <select
            name="route"
            value={route}
            onChange={onChange}
            required
            className="form-control"
          >
            <option value="">-- Select a Route --</option>
            {routes.map(route => (
              <option key={route._id} value={route._id}>
                {route.name} - {route.from && route.to ? 
                  `From ${route.from.name || 'Origin'} to ${route.to.name || 'Destination'}` : 
                  `Price: $${route.price}`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Travel Date</label>
          <input
            type="date"
            name="date"
            value={date}
            onChange={onChange}
            min={formatDate()}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Departure Time</label>
          <select
            name="time"
            value={time}
            onChange={onChange}
            required
            className="form-control"
          >
            <option value="">-- Select Time --</option>
            <option value="06:00">06:00 AM</option>
            <option value="08:00">08:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="14:00">02:00 PM</option>
            <option value="16:00">04:00 PM</option>
            <option value="18:00">06:00 PM</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="passengers">Number of Passengers</label>
          <input
            type="number"
            name="passengers"
            value={passengers}
            onChange={onChange}
            min="1"
            max="10"
            required
            className="form-control"
          />
        </div>

        <div className="price-display p-1 my-2 bg-primary text-center text-white">
          <h3>Total Price: ${calculatedPrice.toFixed(2)}</h3>
        </div>

        <button
          type="submit"
          className="btn btn-dark btn-block"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Booking...' : 'Book Now'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm; 