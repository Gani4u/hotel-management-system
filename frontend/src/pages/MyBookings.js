import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/pages.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const customer =
    JSON.parse(localStorage.getItem("customer")) ||
    JSON.parse(localStorage.getItem("user")) ||
    {};

  useEffect(() => {
    if (!customer.id) {
      navigate('/');
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

 const handleCancelBooking = async () => {
   if (!selectedBookingId) return;

   setCancellingId(selectedBookingId);

   try {
     await API.delete(`/customer/bookings/${selectedBookingId}`);

     setBookings((prev) =>
       prev.map((b) =>
         b.id === selectedBookingId ? { ...b, status: "cancelled" } : b,
       ),
     );

     setShowModal(false);
     setSelectedBookingId(null);
   } catch (err) {
     setError(err.response?.data?.message || "Failed to cancel booking");
   } finally {
     setCancellingId(null);
   }
 };
 const handleDownloadBill = async (bookingId) => {
   try {
     const response = await API.get(`/bookings/${bookingId}/bill`, {
       responseType: "blob",
     });

     const url = window.URL.createObjectURL(new Blob([response.data]));
     const link = document.createElement("a");
     link.href = url;
     link.setAttribute("download", `invoice_${bookingId}.pdf`);
     document.body.appendChild(link);
     link.click();
     link.remove();
   } catch (err) {
     setError("Failed to download bill");
   }
 };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customer');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading your bookings...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="customer-header">
        <h1>My Bookings</h1>
        <p>Welcome back, {customer.name}! Manage your reservations</p>
      </div>

      <div className="page-header">
        <div style={{ flex: 1 }}>
          <p
            style={{
              color: "#e2e8f0",
              margin: "0",
              fontSize: "16px",
              opacity: "0.9",
            }}
          >
            View and manage all your hotel bookings in one place
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate("/browse-rooms")}
            className="btn-book"
            style={{ marginRight: "15px" }}
          >
            Book More Rooms
          </button>
          <button onClick={handleLogout} className="btn-customer-logout">
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 ? (
        <div className="coming-soon">
          <p>
            You haven't made any bookings yet.{" "}
            <span
              onClick={() => navigate("/browse-rooms")}
              style={{
                color: "#3b82f6",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Book a room now!
            </span>
          </p>
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
                    <span
                      className={`status-badge status-${booking.status.toLowerCase()}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {/* Cancel Button */}
                    {(booking.status === "reserved" ||
                      booking.status === "checked_in") && (
                      <button
                        onClick={() => {
                          setSelectedBookingId(booking.id);
                          setShowModal(true);
                        }}
                        className="btn-small btn-danger"
                        style={{ marginRight: "8px" }}
                      >
                        Cancel
                      </button>
                    )}

                    {/* Download Bill Button */}
                    {booking.status === "checked_out" && (
                      <button
                        onClick={() => handleDownloadBill(booking.id)}
                        className="btn-small btn-primary"
                      >
                        Download Bill
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Cancel Booking</h3>
            <p>Are you sure you want to cancel this booking?</p>
            <p>Cancellation is non-refundable.</p>

            <div className="modal-actions">
              <button
                className="btn-small"
                onClick={() => {
                  setShowModal(false);
                  setSelectedBookingId(null);
                }}
              >
                No
              </button>

              <button
                className="btn-small btn-danger"
                onClick={handleCancelBooking}
                disabled={cancellingId === selectedBookingId}
              >
                {cancellingId === selectedBookingId
                  ? "Cancelling..."
                  : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
