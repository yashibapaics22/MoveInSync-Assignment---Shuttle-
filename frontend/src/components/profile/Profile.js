import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';

const Profile = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { user, loading } = authContext;
  const { setAlert } = alertContext;

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const { name, email, phone } = profile;

  const onChange = e => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const onSubmit = e => {
    e.preventDefault();
    if (name === '' || email === '') {
      setAlert('Name and email are required', 'danger');
    } else {
      // This would typically call an update profile function
      // For this demo we'll just show an alert
      setAlert('Profile updated successfully', 'success');
    }
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-primary">Profile</h1>
      <div className="card bg-light">
        <div className="grid-2">
          <div>
            <div className="text-center">
              <i className="fas fa-user fa-5x text-primary" />
              <p className="lead">{user.name}</p>
              <p>
                <span className="badge badge-success">
                  {user.isAdmin ? 'Admin' : 'User'}
                </span>
              </p>
              <p>Member since: {new Date(user.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <h2 className="text-dark">Edit Profile</h2>
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  disabled // Email should not be editable for security reasons
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={phone}
                  onChange={onChange}
                />
              </div>
              <div>
                <input
                  type="submit"
                  value="Update Profile"
                  className="btn btn-primary btn-block"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="card bg-light my-1">
        <h3 className="text-primary">Change Password</h3>
        <form>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
            />
          </div>
          <div>
            <input
              type="submit"
              value="Change Password"
              className="btn btn-dark btn-block"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 