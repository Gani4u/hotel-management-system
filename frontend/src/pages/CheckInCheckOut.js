import { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/pages.css';

export default function CheckInCheckOut() {
  const [checkIns, setCheckIns] = useState([]);
  const [checkOuts, setCheckOuts] = useState([]);
  const [activeTab, setActiveTab] = useState('check-in');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showAccessModal, setShowAccessModal] = useState(false);

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user.role !== 'admin' && user.role !== 'staff') {
      setShowAccessModal(true);
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [checkInResponse, checkOutResponse] = await Promise.all([
        API.get('/bookings/today/check-ins'),
        API.get('/bookings/today/check-outs')
      ]);

      setCheckIns(checkInResponse.data.data);
      setCheckOuts(checkOutResponse.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await API.post(`/bookings/${selectedBookingId}/check-in`);

      setShowCheckInModal(false);
      setSuccessMessage("Guest checked in successfully");
      setShowSuccessModal(true);

      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      await API.post(`/bookings/${selectedBookingId}/check-out`, {
        paymentStatus: selectedPaymentStatus,
      });

      setShowCheckOutModal(false);
      setSuccessMessage("Guest checked out successfully");
      setShowSuccessModal(true);

      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Check-out failed");
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading check-in/check-out data...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Check-In / Check-Out Management</h1>
        <button
          onClick={fetchData}
          className="btn-edit"
          style={{ fontSize: "14px", padding: "10px 16px" }}
        >
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "check-in" ? "active" : ""}`}
          onClick={() => setActiveTab("check-in")}
        >
          ✓ Today's Check-Ins ({checkIns.length})
        </button>
        <button
          className={`tab-button ${activeTab === "check-out" ? "active" : ""}`}
          onClick={() => setActiveTab("check-out")}
        >
          ✗ Today's Check-Outs ({checkOuts.length})
        </button>
      </div>

      {/* CHECK-IN TAB */}
      {activeTab === "check-in" && (
        <div className="tab-content">
          {checkIns.length === 0 ? (
            <div className="coming-soon">
              <p>No pending check-ins for today</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Guest Name</th>
                    <th>Phone</th>
                    <th>Room Number</th>
                    <th>Room Type</th>
                    <th>Check-In Date</th>
                    <th>Special Requests</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {checkIns.map((booking) => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>{booking.customer_name}</td>
                      <td>{booking.customer_phone}</td>
                      <td>{booking.room_number}</td>
                      <td>{booking.type}</td>
                      <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                      <td>
                        <span className="special-requests">
                          {booking.special_requests || "-"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedBookingId(booking.id);
                            setShowCheckInModal(true);
                          }}
                          className="btn-small btn-success"
                        >
                          Check In
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CHECK-OUT TAB */}
      {activeTab === "check-out" && (
        <div className="tab-content">
          {checkOuts.length === 0 ? (
            <div className="coming-soon">
              <p>No pending check-outs for today</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Guest Name</th>
                    <th>Phone</th>
                    <th>Room Number</th>
                    <th>Room Type</th>
                    <th>Check-Out Date</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {checkOuts.map((booking) => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>{booking.customer_name}</td>
                      <td>{booking.customer_phone}</td>
                      <td>{booking.room_number}</td>
                      <td>{booking.type}</td>
                      <td>
                        {new Date(booking.check_out).toLocaleDateString()}
                      </td>
                      <td>${booking.total_amount.toFixed(2)}</td>
                      <td>
                        <span
                          className={`status-badge status-${booking.payment_status}`}
                        >
                          {booking.payment_status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="payment-select"
                          onChange={(e) => {
                            if (!e.target.value) return;

                            setSelectedBookingId(booking.id);
                            setSelectedPaymentStatus(e.target.value);
                            setShowCheckOutModal(true);
                          }}
                          defaultValue=""
                        >
                          <option value="">Select Payment</option>
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {showAccessModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Access Denied</h3>
            <p>You are not authorized to access this page.</p>

            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={() => setShowAccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {showCheckInModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Check-In</h3>
            <p>Mark this guest as checked in?</p>

            <div className="modal-actions">
              <button
                onClick={() => setShowCheckInModal(false)}
                className="btn-small"
              >
                Cancel
              </button>

              <button onClick={handleCheckIn} className="btn-small btn-success">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showCheckOutModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Check-Out</h3>
            <p>Mark this guest as checked out?</p>
            <p>
              <strong>Payment:</strong> {selectedPaymentStatus}
            </p>

            <div className="modal-actions">
              <button
                onClick={() => setShowCheckOutModal(false)}
                className="btn-small"
              >
                Cancel
              </button>

              <button onClick={handleCheckOut} className="btn-small btn-danger">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Success ✅</h3>
            <p>{successMessage}</p>

            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={() => setShowSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
