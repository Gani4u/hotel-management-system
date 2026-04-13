import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loginTab, setLoginTab] = useState('customer');
  const [registerTab, setRegisterTab] = useState('customer');

  const openLoginModal = (tab = 'customer') => {
    setLoginTab(tab);
    setLoginModalOpen(true);
  };

  const openRegisterModal = (tab = 'customer') => {
    setRegisterTab(tab);
    setRegisterModalOpen(true);
  };

  const closeModals = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
  };

  const switchToRegister = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  };

  const switchToLogin = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.openLogin) {
      openLoginModal(location.state.loginTab || 'customer');
      if (location.state.returnTo) {
        localStorage.setItem('returnTo', location.state.returnTo);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }

    if (location.state?.openRegister) {
      openRegisterModal(location.state.registerTab || 'customer');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <>
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
          <button onClick={() => openLoginModal('customer')} className="btn-nav btn-login">
            Customer Login
          </button>
          <button onClick={() => openRegisterModal('customer')} className="btn-nav btn-register">
            Create Account
          </button>
          <button onClick={() => openLoginModal('staff')} className="btn-nav btn-staff">
            Staff Portal
          </button>
        </nav>
      </header>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={closeModals}
        initialTab={loginTab}
        onSwitchToRegister={switchToRegister}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={closeModals}
        initialTab={registerTab}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default Header;