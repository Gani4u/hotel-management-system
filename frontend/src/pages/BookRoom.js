import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import PaymentModal from '../components/PaymentModal';
import '../styles/pages.css';

export default function BookRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
  });
  const [roomDetails, setRoomDetails] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const customer =
    JSON.parse(localStorage.getItem("customer")) ||
    JSON.parse(localStorage.getItem("user")) ||
    {};
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchRoomDetails = useCallback(async () => {
    try {
      setPageLoading(true);
      const response = await API.get(`/public/rooms/${roomId}`);
      setRoomDetails(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load room details');
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  const calculateTotal = (checkIn, checkOut, price) => {
    if (checkIn && checkOut && price) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (nights > 0) {
        return nights * price;
      }
    }
    return 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if ((name === 'checkIn' || name === 'checkOut') && roomDetails) {
      const newTotal = calculateTotal(
        name === 'checkIn' ? value : formData.checkIn,
        name === 'checkOut' ? value : formData.checkOut,
        roomDetails.price
      );
      setTotalAmount(newTotal);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!customer.id) {
      setError("Customer information not found. Please login again.");
      navigate("/");
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      setError("Please select check-in and check-out dates");
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      setError("Check-out date must be after check-in date");
      return;
    }

    setShowConfirmModal(true);
  };

  if (pageLoading) {
    return <div className="page-container"><div className="loading">Loading room details...</div></div>;
  }
  
  const confirmBooking = () => {
    // Move to payment modal instead of directly booking
    setShowConfirmModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentDone = async () => {
    setLoading(true);
    try {
      // Create booking with "completed" payment status - status becomes "pending" in backend
      await API.post("/bookings", {
        roomId: parseInt(roomId, 10),
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        totalAmount,
        paymentStatus: "completed", // Payment marked as completed by customer
      });

      setShowPaymentModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
      setShowPaymentModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setShowConfirmModal(true); // Go back to confirmation modal
  };

  if (!customer.id) {
    return (
      <div className="page-container">
        <div className="error-message">
          Please <a href="/" style={{ color: '#0c4a6e', textDecoration: 'underline' }}>login</a> to book a room
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Book Room</h1>
        <button
          onClick={() => navigate("/browse-rooms")}
          className="btn-primary"
        >
          Back to Rooms
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {roomDetails && (
        <div className="booking-form-container">
          <form onSubmit={handleSubmit} className="booking-form">
            <h2>Booking Details</h2>

            <div className="form-group">
              <label>Room Number</label>
              <input
                type="text"
                value={roomDetails.room_number}
                disabled
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>

            <div className="form-group">
              <label>Room Type</label>
              <input
                type="text"
                value={roomDetails.type}
                disabled
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>

            <div className="form-group">
              <label>Price per Night</label>
              <input
                type="text"
                value={`$${roomDetails.price}`}
                disabled
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>

            <div className="form-group">
              <label>Check-In Date</label>
              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group">
              <label>Check-Out Date</label>
              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                required
                min={formData.checkIn || new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group">
              <label>Guest Name</label>
              <input
                type="text"
                value={customer.name}
                disabled
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={customer.email}
                disabled
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={customer.phone}
                disabled
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>

            {totalAmount > 0 && (
              <div className="total-amount">
                <h3>Total Amount: ${totalAmount.toFixed(2)}</h3>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", marginTop: "20px" }}
            >
              {loading ? "Processing..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      )}
      {showConfirmModal && roomDetails && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Confirm Booking</h2>
            <p>Are you sure you want to book this room?</p>

            <div className="confirm-summary">
              <div className="confirm-summary-item room">
                <label>Room Number</label>
                <value>{roomDetails.room_number}</value>
              </div>
              <div className="confirm-summary-item type">
                <label>Type</label>
                <value>{roomDetails.type}</value>
              </div>
              <div className="confirm-summary-item check-in">
                <label>Check-In</label>
                <value>{new Date(formData.checkIn).toLocaleDateString()}</value>
              </div>
              <div className="confirm-summary-item check-out">
                <label>Check-Out</label>
                <value>{new Date(formData.checkOut).toLocaleDateString()}</value>
              </div>
              <div className="confirm-summary-item total">
                <label>Total Amount</label>
                <value>${totalAmount.toFixed(2)}</value>
              </div>
            </div>

            <div className="confirm-modal-actions">
              <button
                className="cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>

              <button
                className="confirm"
                onClick={confirmBooking}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        open={showPaymentModal}
        roomDetails={roomDetails}
        totalAmount={totalAmount}
        formData={formData}
        onCancel={handlePaymentCancel}
        onDone={handlePaymentDone}
        loading={loading}
      />

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Booking Successful 🎉</h3>
            <p>Your payment has been received. Your booking is pending admin verification. You will receive a confirmation email once approved.</p>

            <div className="modal-actions">
              <button
                className="btn-small btn-primary"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/my-bookings");
                }}
              >
                Go to My Bookings
              </button>

              <button
                className="btn-small"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/browse-rooms");
                }}
              >
                Book More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
