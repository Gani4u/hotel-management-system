import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/landing.css';

export default function Landing() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomType, setRoomType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/public/rooms');
      setRooms(response.data.data);
      setFilteredRooms(response.data.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let filtered = rooms;

    if (roomType) {
      filtered = filtered.filter(room => room.type.toLowerCase() === roomType.toLowerCase());
    }

    setFilteredRooms(filtered);
  };

  const handleBookNow = (roomId) => {
    const customer = localStorage.getItem('customer');
    if (customer) {
      navigate(`/book-room/${roomId}`, { 
        state: { checkIn, checkOut } 
      });
    } else {
      navigate('/customer-login', { 
        state: { returnTo: `/book-room/${roomId}`, checkIn, checkOut } 
      });
    }
  };

  if (loading) {
    return (
      <div className="landing-page">
        <div className="loading">Loading available rooms...</div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <h1>🏨 Hotel Management System</h1>
          <p>Find and book your perfect stay</p>
        </div>
        <div className="header-buttons">
          <button onClick={() => navigate('/customer-login')} className="btn-header btn-login">
            Customer Login
          </button>
          <button onClick={() => navigate('/customer-register')} className="btn-header btn-register">
            Create Account
          </button>
          <button onClick={() => navigate('/login')} className="btn-header btn-staff">
            Staff Portal
          </button>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <h2>Find Your Perfect Room</h2>
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <label>Check-In Date</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Check-Out Date</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Room Type</label>
              <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                <option value="">All Types</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
                <option value="deluxe">Deluxe</option>
              </select>
            </div>

            <button type="submit" className="btn-search">Search Rooms</button>
          </form>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="rooms-section">
        <div className="rooms-container">
          <h2>Available Rooms</h2>
          {filteredRooms.length === 0 ? (
            <div className="no-rooms">
              <p>No rooms available for the selected criteria. Please try different dates or room type.</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {filteredRooms.map((room) => (
                <div key={room.id} className="room-card">
                  <div className="room-image">
                    <span className="room-type-badge">{room.type}</span>
                  </div>
                  <div className="room-content">
                    <h3>Room {room.room_number}</h3>
                    <p className="room-description">{room.description || `${room.type} room with great amenities`}</p>
                    
                    <div className="room-details">
                      <div className="detail">
                        <span className="detail-label">Capacity:</span>
                        <span className="detail-value">{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
                      </div>
                      <div className="detail">
                        <span className="detail-label">Price:</span>
                        <span className="detail-value price">₹{room.price}/night</span>
                      </div>
                    </div>

                    {room.amenities && (
                      <div className="amenities">
                        <strong>Amenities:</strong>
                        <p>{room.amenities}</p>
                      </div>
                    )}

                    {checkIn && checkOut && (
                      <div className="booking-summary">
                        {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} nights = ₹
                        {room.price * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))}
                      </div>
                    )}

                    <button
                      onClick={() => handleBookNow(room.id)}
                      className="btn-book-now"
                      disabled={!checkIn || !checkOut || new Date(checkIn) >= new Date(checkOut)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <h3>Best Prices</h3>
            <p>Guaranteed lowest rates for hotel rooms across all categories</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <h3>24/7 Support</h3>
            <p>Round-the-clock customer support for all your needs</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <h3>Easy Booking</h3>
            <p>Simple and secure booking process in just a few clicks</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <h3>Free Cancellation</h3>
            <p>Cancel your booking anytime before check-in at no cost</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Hotel Management System</h4>
            <p>Your trusted partner for hotel bookings and reservations</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#rooms">Available Rooms</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@hotel.com</p>
            <p>Phone: 1-800-HOTEL-01</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Hotel Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
