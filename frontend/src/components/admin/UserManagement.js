import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';
import Spinner from '../layout/Spinner';

const UserManagement = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  
  const { user } = authContext;
  const { setAlert } = alertContext;
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For demonstration, creating mock user data
  useEffect(() => {
    const mockUsers = [
      {
        _id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        isAdmin: true,
        date: new Date('2023-01-15').toISOString()
      },
      {
        _id: '2',
        name: 'John Doe',
        email: 'john@example.com',
        isAdmin: false,
        date: new Date('2023-02-20').toISOString()
      },
      {
        _id: '3',
        name: 'Jane Smith',
        email: 'jane@example.com',
        isAdmin: false,
        date: new Date('2023-03-10').toISOString()
      },
      {
        _id: '4',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        isAdmin: false,
        date: new Date('2023-04-05').toISOString()
      }
    ];
    
    // Add the current user to the list if not already present
    if (user && !mockUsers.some(u => u.email === user.email)) {
      mockUsers.push({
        _id: '5',
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        date: user.date
      });
    }
    
    setUsers(mockUsers);
    setLoading(false);
  }, [user]);
  
  const toggleAdminStatus = (userId) => {
    setUsers(
      users.map(user => 
        user._id === userId
          ? { ...user, isAdmin: !user.isAdmin }
          : user
      )
    );
    
    setAlert('User admin status updated successfully', 'success');
  };
  
  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user._id !== userId));
      setAlert('User deleted successfully', 'success');
    }
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <div className="card bg-light">
      <h2 className="text-primary text-center">User Management</h2>
      
      <div className="alert alert-info">
        <p>
          <i className="fas fa-info-circle"></i> This is a demo page. In a real application, these actions would update the database.
        </p>
      </div>
      
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(userItem => (
            <tr key={userItem._id}>
              <td>{userItem.name}</td>
              <td>{userItem.email}</td>
              <td>
                <span className={`badge ${userItem.isAdmin ? 'badge-primary' : 'badge-secondary'}`}>
                  {userItem.isAdmin ? 'Admin' : 'User'}
                </span>
              </td>
              <td>{new Date(userItem.date).toLocaleDateString()}</td>
              <td>
                <button
                  className={`btn btn-sm ${userItem.isAdmin ? 'btn-warning' : 'btn-success'} mr-2`}
                  onClick={() => toggleAdminStatus(userItem._id)}
                >
                  {userItem.isAdmin ? 'Remove Admin' : 'Make Admin'}
                </button>
                
                {userItem._id !== user._id && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteUser(userItem._id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement; 