export default function PaymentModal({
  open,
  roomDetails,
  totalAmount,
  formData,
  onCancel,
  onDone,
  loading,
}) {
  if (!open || !roomDetails) return null;

  return (
    <div className="modal-overlay">
      <div className="payment-modal">
        <h2>💳 Complete Payment</h2>
        <p>Secure payment for your booking</p>

        {/* Booking Summary */}
        <div className="payment-summary">
          <div className="payment-summary-item room">
            <label>Room Number</label>
            <value>{roomDetails.room_number}</value>
          </div>
          <div className="payment-summary-item check-in">
            <label>Check-In</label>
            <value>{new Date(formData.checkIn).toLocaleDateString()}</value>
          </div>
          <div className="payment-summary-item check-out">
            <label>Check-Out</label>
            <value>{new Date(formData.checkOut).toLocaleDateString()}</value>
          </div>
          <div className="payment-summary-item total">
            <label>Total Amount</label>
            <value>₹{totalAmount.toFixed(2)}</value>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="qr-code-container">
          <p className="qr-instruction">📱 Scan QR Code to Complete Payment</p>

          {/* Simulated QR Code */}
          <svg viewBox="0 0 200 200" className="qr-code-svg">
            <rect width="200" height="200" fill="white" />

            {/* Top-left position marker */}
            <rect x="10" y="10" width="40" height="40" fill="black" />
            <rect x="15" y="15" width="30" height="30" fill="white" />
            <rect x="20" y="20" width="20" height="20" fill="black" />

            {/* Top-right position marker */}
            <rect x="150" y="10" width="40" height="40" fill="black" />
            <rect x="155" y="15" width="30" height="30" fill="white" />
            <rect x="160" y="20" width="20" height="20" fill="black" />

            {/* Bottom-left position marker */}
            <rect x="10" y="150" width="40" height="40" fill="black" />
            <rect x="15" y="155" width="30" height="30" fill="white" />
            <rect x="20" y="160" width="20" height="20" fill="black" />

            {/* QR pattern */}
            <rect x="70" y="50" width="10" height="10" fill="black" />
            <rect x="85" y="50" width="10" height="10" fill="black" />
            <rect x="100" y="50" width="10" height="10" fill="black" />
            <rect x="115" y="50" width="10" height="10" fill="black" />

            <rect x="70" y="70" width="10" height="10" fill="black" />
            <rect x="100" y="70" width="10" height="10" fill="black" />
            <rect x="130" y="70" width="10" height="10" fill="black" />

            <rect x="85" y="85" width="10" height="10" fill="black" />
            <rect x="115" y="85" width="10" height="10" fill="black" />

            <rect x="70" y="100" width="10" height="10" fill="black" />
            <rect x="100" y="100" width="10" height="10" fill="black" />
            <rect x="130" y="100" width="10" height="10" fill="black" />

            <rect x="75" y="120" width="10" height="10" fill="black" />
            <rect x="105" y="120" width="10" height="10" fill="black" />
          </svg>

          <p className="qr-text">Use your payment app to scan</p>
        </div>

        {/* Instructions */}
        <div className="payment-instructions">
          <ol>
            <li>Open your payment app (Google Pay, PhonePe, Paytm)</li>
            <li>Scan the QR code above</li>
            <li>
              Enter amount: <strong>₹{totalAmount.toFixed(2)}</strong>
            </li>
            <li>Complete payment and click Done</li>
          </ol>
        </div>

        {/* Safety Note */}
        <div className="payment-note">
          ⏱️ <strong>Note:</strong> Your booking will be pending admin
          verification after payment.
        </div>

        {/* Action Buttons */}
        <div className="payment-modal-actions">
          <button className="cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="confirm" onClick={onDone} disabled={loading}>
            {loading ? "Processing..." : "✓ Payment Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
