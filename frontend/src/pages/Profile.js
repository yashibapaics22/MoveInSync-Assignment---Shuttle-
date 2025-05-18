import React, { useState, useEffect } from 'react';
import { getWalletBalance, getTransactionHistory } from '../services/walletService';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [walletData, setWalletData] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        const userData = {
          name: storedUser.name || 'User',
          email: storedUser.email || 'user@example.com',
          role: storedUser.role || 'student'
        };
        
        setUser(userData);
        
        // Get wallet data
        const walletResponse = await getWalletBalance();
        setWalletData({
          balance: walletResponse.data.points,
          transactions: walletResponse.data.transactions || []
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }
  
  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h2>{user?.name}</h2>
              <p className="user-email">{user?.email}</p>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
        </div>
        
        <div className="wallet-card">
          <h3>Wallet Balance</h3>
          <div className="balance-amount">{walletData.balance} points</div>
          
          <div className="transactions">
            <h4>Recent Transactions</h4>
            
            {walletData.transactions.length === 0 ? (
              <p className="no-transactions">No transactions found.</p>
            ) : (
              <div className="transaction-list">
                {walletData.transactions.map((transaction, index) => (
                  <div 
                    key={index} 
                    className={`transaction-item ${transaction.type}`}
                  >
                    <div className="transaction-details">
                      <span className="transaction-type">
                        {transaction.type === 'credit' ? 'Added' : 'Used'}
                      </span>
                      <span className="transaction-description">
                        {transaction.description}
                      </span>
                    </div>
                    <div className="transaction-values">
                      <span className="transaction-amount">
                        {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} points
                      </span>
                      <span className="transaction-date">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 