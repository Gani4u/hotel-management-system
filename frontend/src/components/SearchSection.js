import React from 'react';

const SearchSection = ({ checkIn, setCheckIn, checkOut, setCheckOut, roomType, setRoomType, onSearch }) => {
  return (
    <section className="search-section">
      <div className="search-container">
        <div className="search-header">
          <h2>Find Your Perfect Room</h2>
          <p>Search through our collection of premium accommodations</p>
        </div>
        <form onSubmit={onSearch} className="search-form">
          <div className="form-group">
            <label>Check-In Date</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Check-Out Date</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Room Type</label>
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
              <option value="deluxe">Deluxe</option>
            </select>
          </div>

          <button type="submit" className="btn-search">
            <span>🔍</span> Search Rooms
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchSection;