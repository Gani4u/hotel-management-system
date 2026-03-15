import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function LoginModal({ isOpen, onClose, initialTab = 'customer', onSwitchToRegister }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const returnTo = localStorage.getItem('returnTo');
      if (returnTo) {
        localStorage.removeItem('returnTo');
      }

      let response;
      if (activeTab === 'customer') {
        response = await API.post('/customer/login', { email, password });
        localStorage.setItem('token', response.data.token);
        const customerData = response.data.customer || response.data.user;
        localStorage.setItem('customer', JSON.stringify(customerData));
        navigate(returnTo || '/browse-rooms');
      } else {
        response = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate(returnTo || '/dashboard');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveTab('customer')}
          >
            Customer Login
          </button>
          <button
            className={`modal-tab ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff Portal
          </button>
        </div>

        <div className="modal-header">
          <h2>{activeTab === 'customer' ? 'Welcome Back' : 'Staff Portal'}</h2>
          <p>{activeTab === 'customer' ? 'Book your perfect stay' : 'Access the management system'}</p>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="modal-input"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="modal-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="modal-error">{error}</div>}

          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="modal-footer">
          <p>Don't have an account?</p>
          <span className="modal-link" onClick={onSwitchToRegister}>
            Create Account
          </span>
        </div>
      </div>
    </div>
  );
}