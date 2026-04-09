import { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/pages.css';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    if (activeTab === 'all') {
      fetchBookings();
    } else if (activeTab === 'pending') {
      fetchPendingBookings();
    }
  }, [activeTab]);

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

  const fetchPendingBookings = async () => {
    try {
      const response = await API.get('/bookings/pending-bookings/list');
      setPendingBookings(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending bookings');
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      setUpdatingId(bookingId);
      await API.post(`/bookings/${bookingId}/check-in`);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      setUpdatingId(bookingId);
      await API.post(`/bookings/${bookingId}/check-out`);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveBooking = (bookingId) => {
    setSelectedBooking(bookingId);
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    try {
      setUpdatingId(selectedBooking);
      await API.post(`/bookings/${selectedBooking}/approve`, {
        adminNotes: approvalNotes,
      });
      setShowApprovalModal(false);
      setApprovalNotes('');
      setSelectedBooking(null);
      fetchPendingBookings();
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setUpdatingId(bookingId);
      await API.post(`/bookings/${bookingId}/cancel-pending`, {
        adminNotes: 'Cancelled by admin',
      });
      fetchPendingBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed');
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
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading && activeTab === 'all') {
    return <div className="page-container"><div className="loading">Loading bookings...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bookings Management</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '30px' }}>
        <button
          className={activeTab === 'all' ? 'tab active' : 'tab'}
          onClick={() => handleTabChange('all')}
        >
          All Bookings
        </button>
        <button
          className={activeTab === 'pending' ? 'tab active' : 'tab'}
          onClick={() => handleTabChange('pending')}
        >
          📋 Pending Approval ({pendingBookings.length})
        </button>
      </div>

      {/* ALL BOOKINGS TAB */}
      {activeTab === 'all' && (
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
                    {booking.status === "reserved" && isToday(booking.check_in) && (
                      <button
                        onClick={() => handleCheckIn(booking.id)}
                        disabled={updatingId === booking.id}
                        className="btn-small btn-edit"
                      >
                        Check-In
                      </button>
                    )}

                    {booking.status === "reserved" && isPast(booking.check_in) && (
                      <button className="btn-small" disabled style={{ opacity: 0.5 }}>
                        No Show
                      </button>
                    )}

                    {booking.status === "reserved" &&
                      !isToday(booking.check_in) &&
                      !isPast(booking.check_in) && (
                        <button className="btn-small" disabled style={{ opacity: 0.5 }}>
                          Upcoming
                        </button>
                      )}

                    {booking.status === "checked_in" && (
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        disabled={updatingId === booking.id}
                        className="btn-small btn-edit"
                      >
                        Check-Out
                      </button>
                    )}

                    {booking.status === "checked_out" && (
                      <span style={{ color: '#64748b' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PENDING BOOKINGS TAB */}
      {activeTab === 'pending' && (
        <div>
          {pendingBookings.length === 0 ? (
            <div className="coming-soon">
              ✅ No pending bookings at this time. All payments have been verified!
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Guest Name</th>
                    <th>Email</th>
                    <th>Room</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>{booking.name}</td>
                      <td>{booking.email}</td>
                      <td>{booking.room_number} ({booking.type})</td>
                      <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                      <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                      <td>
                        <strong>${Number(booking.total_amount || 0).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className="status-badge status-pending">
                          ✓ {booking.payment_status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleApproveBooking(booking.id)}
                            disabled={updatingId === booking.id}
                            className="btn-small btn-success"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white'
                            }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={updatingId === booking.id}
                            className="btn-small btn-danger"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>✅ Approve Booking</h3>
            <p>Are you sure you want to approve this booking?</p>

            <div className="form-group">
              <label>Admin Notes (Optional)</label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                rows="4"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-small"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-small btn-primary"
                onClick={confirmApproval}
                disabled={updatingId === selectedBooking}
              >
                {updatingId === selectedBooking ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
