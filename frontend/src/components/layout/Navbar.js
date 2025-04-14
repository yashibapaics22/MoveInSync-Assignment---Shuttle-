import React, { Fragment, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;

  const onLogout = () => {
    logout();
  };

  const authLinks = (
    <Fragment>
      <li>
        <Link to="/">Dashboard</Link>
      </li>
      {user && !user.isAdmin && (
        <Fragment>
          <li>
            <Link to="/bookings/my-bookings">My Bookings</Link>
          </li>
          <li>
            <Link to="/locations/suggest">Suggest Location</Link>
          </li>
        </Fragment>
      )}
      <li>
        <Link to="/locations">Locations</Link>
      </li>
      <li>
        <Link to="/routes">Routes</Link>
      </li>
      <li>
        <Link to="/profile">Profile</Link>
      </li>
      {user && user.isAdmin && (
        <Fragment>
          <li>
            <Link to="/locations/add">Add Location</Link>
          </li>
          <li>
            <Link to="/locations/suggestions">Location Suggestions</Link>
          </li>
          <li>
            <Link to="/routes/add">Add Route</Link>
          </li>
        </Fragment>
      )}
      <li>
        <a onClick={onLogout} href="#!">
          <span className="hide-sm">Logout</span>
        </a>
      </li>
    </Fragment>
  );

  const guestLinks = (
    <Fragment>
      <li>
        <Link to="/register">Register</Link>
      </li>
      <li>
        <Link to="/login">Login</Link>
      </li>
    </Fragment>
  );

  return (
    <div className="navbar bg-primary">
      <h1>
        <Link to="/">
          <i className="fas fa-shuttle-van"></i> ShuttleBooker
        </Link>
      </h1>
      <ul>{isAuthenticated ? authLinks : guestLinks}</ul>
    </div>
  );
};

export default Navbar; 