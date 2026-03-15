import React from 'react';

const RoomCard = ({ room, checkIn, checkOut, onBookNow }) => {
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = nights * room.price;

  return (
    <div className="room-card">
      <div className="room-image">
        <div className="room-image-overlay"></div>
        <span className="room-type-badge">{room.type}</span>
        <div className="room-price-tag">₹{room.price}/night</div>
      </div>
      <div className="room-content">
        <h3>Room {room.room_number}</h3>
        <p className="room-description">{room.description || `${room.type} room with great amenities`}</p>

        <div className="room-details">
          <div className="detail">
            <span className="detail-icon">👥</span>
            <span className="detail-text">{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          <div className="detail">
            <span className="detail-icon">📐</span>
            <span className="detail-text">{room.type}</span>
          </div>
        </div>

        {room.amenities && (
          <div className="amenities">
            <strong>Amenities:</strong>
            <p>{room.amenities}</p>
          </div>
        )}

        {nights > 0 && (
          <div className="booking-summary">
            <div className="summary-row">
              <span>{nights} night{nights > 1 ? 's' : ''} × ₹{room.price}</span>
              <span className="total-price">₹{totalPrice}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => onBookNow(room.id)}
          className="btn-book-now"
          disabled={!checkIn || !checkOut || new Date(checkIn) >= new Date(checkOut)}
        >
          {checkIn && checkOut ? 'Book Now' : 'Select Dates First'}
        </button>
      </div>
    </div>
  );
};

const RoomsSection = ({ rooms, checkIn, checkOut, onBookNow }) => {
  return (
    <section className="rooms-section">
      <div className="rooms-container">
        <div className="section-header">
          <h2>Available Rooms</h2>
          <p>Choose from our selection of premium accommodations</p>
        </div>
        {rooms.length === 0 ? (
          <div className="no-rooms">
            <div className="no-rooms-icon">🏨</div>
            <h3>No rooms available</h3>
            <p>No rooms available for the selected criteria. Please try different dates or room type.</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                checkIn={checkIn}
                checkOut={checkOut}
                onBookNow={onBookNow}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RoomsSection;