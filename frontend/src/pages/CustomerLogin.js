import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

export default function CustomerLogin() {
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
      const response = await API.post('/customer/login', { email, password });
      localStorage.setItem('token', response.data.token);
      // Support both 'customer' and 'user' field names
      const customerData = response.data.customer || response.data.user;
      localStorage.setItem('customer', JSON.stringify(customerData));
      navigate('/browse-rooms');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Customer Login</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>Book your perfect stay</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Don't have an account?</p>
          <Link to="/" className="auth-link">Register here</Link>
        </div>
        <div className="auth-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '15px' }}>
          <p>Are you staff or admin?</p>
          <Link to="/" className="auth-link">Login here</Link>
        </div>
      </div>
    </div>
  );
}
