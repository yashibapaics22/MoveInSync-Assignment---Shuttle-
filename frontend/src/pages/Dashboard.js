import React, { useState, useEffect } from 'react';
import { getWalletBalance } from '../services/walletService';
import { getUserTrips } from '../services/tripService';
import WalletCard from '../components/WalletCard';
import QuickBookCard from '../components/QuickBookCard';
import RecentTripsCard from '../components/RecentTripsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const walletResponse = await getWalletBalance();
        const tripsResponse = await getUserTrips({ limit: 5 });
        
        // Get user role from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        setUserRole(userData?.role || '');
        
        setBalance(walletResponse.data.points || 0);
        setTrips(tripsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const handleBalanceUpdate = (newBalance) => {
    setBalance(newBalance);
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading dashboard data..." />;
  }
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        <WalletCard balance={balance} onBalanceUpdate={handleBalanceUpdate} />
        {userRole !== 'admin' && <QuickBookCard />}
        <RecentTripsCard trips={trips} />
      </div>
    </div>
  );
};

export default Dashboard;