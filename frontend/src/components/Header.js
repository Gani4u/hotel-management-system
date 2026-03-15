import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="landing-header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🏨</span>
          <div className="logo-text">
            <h1>Luxury Hotel</h1>
            <span>Management System</span>
          </div>
        </div>
      </div>
      <nav className="header-nav">
        <button onClick={() => navigate('/customer-login')} className="btn-nav btn-login">
          Customer Login
        </button>
        <button onClick={() => navigate('/customer-register')} className="btn-nav btn-register">
          Create Account
        </button>
        <button onClick={() => navigate('/login')} className="btn-nav btn-staff">
          Staff Portal
        </button>
      </nav>
    </header>
  );
};

export default Header;