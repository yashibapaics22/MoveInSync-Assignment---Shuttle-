import React, { useState } from 'react';
import { addFunds, getWalletBalance } from '../services/walletService';

const WalletCard = ({ balance, onBalanceUpdate }) => {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Adding funds, amount:', parseFloat(amount));
      
      // Add funds to wallet
      const response = await addFunds({ amount: parseFloat(amount) });
      console.log('Add funds response:', response);
      
      setSuccess('Funds added successfully!');
      setAmount('');
      setShowAddFunds(false);
      
      // Refresh the balance
      if (onBalanceUpdate) {
        try {
          const response = await getWalletBalance();
          console.log('Updated wallet balance:', response.data);
          onBalanceUpdate(response.data.points || 0);
        } catch (err) {
          console.error('Error refreshing balance:', err);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error adding funds:', err);
      setError(err.response?.data?.message || 'Failed to add funds. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">Wallet Balance</h3>
      </div>
      <div className="wallet-balance">
        <p className="balance-amount">${balance?.toFixed(2) || '0.00'}</p>
        <p className="balance-info">Available for booking rides</p>
        
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!showAddFunds ? (
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAddFunds(true)}
          >
            Add Funds
          </button>
        ) : (
          <form onSubmit={handleAddFunds} className="add-funds-form">
            <div className="form-group">
              <label htmlFor="amount">Amount ($)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="5"
                step="5"
                required
                placeholder="Enter amount"
              />
            </div>
            <div className="button-group">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !amount}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowAddFunds(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WalletCard;