import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  // user info may be stored under 'user' (staff/admin) or 'customer'
  const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('customer') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // disallow customers from accessing staff/admin area
  if (user.role && user.role === 'customer') {
    // customer should use customer portal
    return <Navigate to="/customer-login" replace />;
  }

  return children;
}
