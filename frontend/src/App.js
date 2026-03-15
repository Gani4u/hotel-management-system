import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Customers from './pages/Customers';
import BrowseRooms from './pages/BrowseRooms';
import BookRoom from './pages/BookRoom';
import MyBookings from './pages/MyBookings';
import CheckInCheckOut from './pages/CheckInCheckOut';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Staff/Admin Routes (legacy - redirect to landing) */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />

        {/* Customer Routes (legacy - redirect to landing) */}
        <Route path="/customer-register" element={<Navigate to="/" replace />} />
        <Route path="/customer-login" element={<Navigate to="/" replace />} />
        <Route path="/browse-rooms" element={<BrowseRooms />} />
        <Route path="/book-room/:roomId" element={<BookRoom />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* Protected Staff/Admin Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="app-layout">
                <Sidebar />
                <div className="app-content">
                  <Navbar />
                  <main className="main-content">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/rooms" element={<Rooms />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/check-in-out" element={<CheckInCheckOut />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
