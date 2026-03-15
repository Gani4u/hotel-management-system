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
      navigate('/');
      return;
    }
    fetchAvailableRooms();
  }, [customer.id, navigate]);

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
    navigate('/');
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading available rooms...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="customer-header">
        <h1>Available Rooms</h1>
        <p>Welcome back, {customer.name}! Discover your perfect stay</p>
      </div>

      <div className="page-header">
        <div style={{ flex: 1 }}>
          <p style={{ color: '#e2e8f0', margin: '0', fontSize: '16px', opacity: '0.9' }}>
            Browse our luxurious rooms and book your dream vacation
          </p>
        </div>
        <div>
          <button onClick={() => navigate('/my-bookings')} className="btn-book" style={{ marginRight: '15px' }}>
            My Bookings
          </button>
          <button onClick={handleLogout} className="btn-customer-logout">Logout</button>
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
                <p><strong>Capacity:</strong> {room.capacity} guests</p>
                <p><strong>Status:</strong> <span className="status-badge status-available">Available</span></p>
              </div>
              <button
                onClick={() => handleBookRoom(room.id)}
                className="btn-book"
                style={{ width: '100%', marginTop: '15px' }}
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
