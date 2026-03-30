import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function RegisterModal({ isOpen, onClose, initialTab = 'customer', onSwitchToLogin }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'customer') {
        await API.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: 'customer',
        });
        alert('Registration successful! Please login to your account.');
      } else {
        await API.post('/auth/register', {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
        });
        alert('Registration successful! Please login with your credentials.');
      }

      navigate('/');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      onClose();
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
            Customer Account
          </button>
          <button
            className={`modal-tab ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff Account
          </button>
        </div>

        <div className="modal-header">
          <h2>Create Your Account</h2>
          <p>{activeTab === 'customer' ? 'Book amazing hotel rooms' : 'Join our management team'}</p>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {activeTab === 'customer' ? (
            <>
              <input
                type="text"
                className="modal-input"
                placeholder="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                className="modal-input"
                placeholder="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                className="modal-input"
                placeholder="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </>
          ) : (
            <>
              <input
                type="text"
                className="modal-input"
                placeholder="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                className="modal-input"
                placeholder="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                className="modal-input"
                placeholder="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <select
                name="role"
                className="modal-select"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          <input
            type="password"
            className="modal-input"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            className="modal-input"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && <div className="modal-error">{error}</div>}

          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="modal-footer">
          <p>Already have an account?</p>
          <span className="modal-link" onClick={switchToLogin}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
}
