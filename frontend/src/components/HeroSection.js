import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ onQuickBook }) => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Welcome to Luxury Hotel</h1>
          <p className="hero-subtitle">Experience unparalleled comfort and elegance in the heart of the city</p>
          <div className="hero-buttons">
            <button onClick={onQuickBook} className="btn-hero-primary">
              Book Your Stay
            </button>
            <button onClick={() => navigate('/browse-rooms')} className="btn-hero-secondary">
              Explore Rooms
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Happy Guests</span>
          </div>
          <div className="stat">
            <span className="stat-number">50+</span>
            <span className="stat-label">Luxury Rooms</span>
          </div>
          <div className="stat">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Concierge Service</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;