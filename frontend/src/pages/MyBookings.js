import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/pages.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem('customer') || '{}');

  useEffect(() => {
    if (!customer.id) {
      navigate('/customer-login');
      return;
    }
    fetchCustomerBookings();
  }, []);

  const fetchCustomerBookings = async () => {
    try {
      setLoading(true);
      const response = await API.get('/customer/bookings');
      setBookings(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await API.delete(`/customer/bookings/${bookingId}`);
        fetchCustomerBookings();
        alert('Booking cancelled successfully');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customer');
    navigate('/customer-login');
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading your bookings...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Bookings</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Welcome, {customer.name}</p>
        </div>
        <div>
          <button onClick={() => navigate('/browse-rooms')} className="btn-primary">Book More Rooms</button>
          <button onClick={handleLogout} className="btn-logout" style={{ marginLeft: '10px' }}>Logout</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 ? (
        <div className="coming-soon">
          <p>You haven't made any bookings yet. <a href="/browse-rooms" style={{ color: '#3b82f6', cursor: 'pointer' }}>Book a room now!</a></p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.room_number}</td>
                  <td>{booking.type}</td>
                  <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                  <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                  <td>${Number(booking.total_amount || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {(booking.status === 'reserved' || booking.status === 'checked_in') && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="btn-small btn-danger"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
