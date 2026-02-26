import { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/pages.css';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await API.get('/bookings');
      setBookings(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      await API.put(`/bookings/${bookingId}`, { status: newStatus });
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading bookings...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bookings Management</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest Name</th>
              <th>Room Number</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>#{booking.id}</td>
                <td>{booking.first_name} {booking.last_name}</td>
                <td>{booking.room_number}</td>
                <td>{new Date(booking.check_in_date).toLocaleDateString()}</td>
                <td>{new Date(booking.check_out_date).toLocaleDateString()}</td>
                <td>${Number(booking.total_amount || 0).toFixed(2)}</td>
                <td><span className={`status-badge status-${booking.status}`}>{booking.status}</span></td>
                <td>
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'checked_in')}
                      disabled={updatingId === booking.id}
                      className="btn-small btn-edit"
                    >
                      Check-In
                    </button>
                  )}
                  {booking.status === 'checked_in' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'checked_out')}
                      disabled={updatingId === booking.id}
                      className="btn-small btn-edit"
                    >
                      Check-Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
