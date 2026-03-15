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

  useEffect(() => {
    if (user.role !== 'admin' && user.role !== 'staff') {
      alert('Access denied');
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

  const handleCheckIn = async (bookingId) => {
    if (window.confirm('Mark this guest as checked in?')) {
      try {
        await API.post(`/bookings/${bookingId}/check-in`);
        alert('Guest checked in successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Check-in failed');
      }
    }
  };

  const handleCheckOut = async (bookingId, paymentStatus) => {
    if (!paymentStatus) {
      alert('Please select payment status');
      return;
    }

    if (window.confirm('Mark this guest as checked out?')) {
      try {
        await API.post(`/bookings/${bookingId}/check-out`, { paymentStatus });
        alert('Guest checked out successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Check-out failed');
      }
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
        <button onClick={fetchData} className="btn-edit" style={{ fontSize: '14px', padding: '10px 16px' }}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'check-in' ? 'active' : ''}`}
          onClick={() => setActiveTab('check-in')}
        >
          ✓ Today's Check-Ins ({checkIns.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'check-out' ? 'active' : ''}`}
          onClick={() => setActiveTab('check-out')}
        >
          ✗ Today's Check-Outs ({checkOuts.length})
        </button>
      </div>

      {/* CHECK-IN TAB */}
      {activeTab === 'check-in' && (
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
                          {booking.special_requests || '-'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleCheckIn(booking.id)}
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
      {activeTab === 'check-out' && (
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
                      <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                      <td>${booking.total_amount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${booking.payment_status}`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="payment-select"
                          onChange={(e) => handleCheckOut(booking.id, e.target.value)}
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
    </div>
  );
}
