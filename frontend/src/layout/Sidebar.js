import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import '../styles/layout.css';

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "☰"}
      </button>
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>HMS</h2>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/rooms"
            className={`nav-link ${isActive("/rooms") ? "active" : ""}`}
          >
            <span className="nav-icon">🏨</span>
            <span>Rooms</span>
          </Link>
          <Link
            to="/check-in-out"
            className={`nav-link ${isActive("/check-in-out") ? "active" : ""}`}
          >
            <span className="nav-icon">🔑</span>
            <span>Check-In/Out</span>
          </Link>
          <Link
            to="/bookings"
            className={`nav-link ${isActive("/bookings") ? "active" : ""}`}
          >
            <span className="nav-icon">📋</span>
            <span>Bookings</span>
          </Link>
          <Link
            to="/customers"
            className={`nav-link ${isActive("/customers") ? "active" : ""}`}
          >
            <span className="nav-icon">👥</span>
            <span>Customers</span>
          </Link>
          <Link
            to="/reviews"
            className={`nav-link ${isActive("/reviews") ? "active" : ""}`}
          >
            <span className="nav-icon">👥</span>
            <span>Reviews</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
