import { useNavigate } from 'react-router-dom';
import '../styles/layout.css';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('customer');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1 className="navbar-title">Hotel Management System</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}
