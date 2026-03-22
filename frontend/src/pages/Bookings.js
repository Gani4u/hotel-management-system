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
  const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);

    return (
      today.getFullYear() === d.getFullYear() &&
      today.getMonth() === d.getMonth() &&
      today.getDate() === d.getDate()
    );
  };

  const isPast = (date) => {
    const today = new Date();
    const d = new Date(date);

    // Remove time for accurate comparison
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    return d < today;
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
                <td>{booking.name}</td>
                <td>{booking.room_number}</td>
                <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                <td>${Number(booking.total_amount || 0).toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  {/* ✅ CASE 1: Show Check-In ONLY on check-in date */}
                  {booking.status === "reserved" &&
                    isToday(booking.check_in) && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(booking.id, "checked_in")
                        }
                        disabled={updatingId === booking.id}
                        className="btn-small btn-edit"
                      >
                        Check-In
                      </button>
                    )}

                  {/* ❌ CASE 2: Past date but not checked-in → No Show */}
                  {booking.status === "reserved" &&
                    isPast(booking.check_in) && (
                      <button className="btn-small btn-disabled" disabled>
                        No Show
                      </button>
                    )}

                  {/* ⏳ CASE 3: Future booking */}
                  {booking.status === "reserved" &&
                    !isToday(booking.check_in) &&
                    !isPast(booking.check_in) && (
                      <button className="btn-small btn-disabled" disabled>
                        Upcoming
                      </button>
                    )}

                  {/* ✅ CASE 4: Checked-in → allow Check-Out */}
                  {booking.status === "checked_in" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(booking.id, "checked_out")
                      }
                      disabled={updatingId === booking.id}
                      className="btn-small btn-edit"
                    >
                      Check-Out
                    </button>
                  )}

                  {/* ✅ CASE 5: Already completed */}
                  {booking.status === "checked_out" && (
                    <span className="text-muted">Completed</span>
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
