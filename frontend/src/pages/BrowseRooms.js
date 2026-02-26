import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/pages.css';

export default function BrowseRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem('customer') || '{}');

  useEffect(() => {
    if (!customer.id) {
      navigate('/customer-login');
      return;
    }
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const response = await API.get('/customer/rooms/available');
      setRooms(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (roomId) => {
    navigate(`/book-room/${roomId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customer');
    navigate('/customer-login');
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading available rooms...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Available Rooms</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Welcome, {customer.name}</p>
        </div>
        <div>
          <button onClick={() => navigate('/my-bookings')} className="btn-primary">My Bookings</button>
          <button onClick={handleLogout} className="btn-logout" style={{ marginLeft: '10px' }}>Logout</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {rooms.length === 0 ? (
        <div className="coming-soon">
          <p>No rooms available at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <h3>Room {room.room_number}</h3>
                <span className="room-type">{room.type}</span>
              </div>
              <div className="room-details">
                <p><strong>Price per night:</strong> ${room.price}</p>
                <p><strong>Status:</strong> <span className="status-badge status-available">Available</span></p>
              </div>
              <button
                onClick={() => handleBookRoom(room.id)}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
