import { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/pages.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await API.get('/dashboard/stats');
      setStats(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading statistics...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏨</div>
            <div className="stat-content">
              <h3>Total Rooms</h3>
              <p className="stat-value">{stats.totalRooms}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Available Rooms</h3>
              <p className="stat-value">{stats.availableRooms}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-content">
              <h3>Booked Rooms</h3>
              <p className="stat-value">{stats.bookedRooms}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">${Number(stats.totalRevenue || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
