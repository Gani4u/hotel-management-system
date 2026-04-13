import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import SearchSection from '../components/SearchSection';
import RoomsSection from '../components/RoomsSection';
import FeaturesSection from '../components/FeaturesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';
import '../styles/landing.css';

export default function Landing() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomType, setRoomType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/public/rooms');
      setRooms(response.data.data);
      setFilteredRooms(response.data.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let filtered = rooms;

    if (roomType) {
      filtered = filtered.filter(room => room.type.toLowerCase() === roomType.toLowerCase());
    }

    setFilteredRooms(filtered);
  };

  const handleBookNow = (roomId) => {
    const customer = localStorage.getItem('customer');
    if (customer) {
      navigate(`/book-room/${roomId}`, {
        state: { checkIn, checkOut }
      });
    } else {
      navigate('/', {
        state: { openLogin: true, loginTab: 'customer', returnTo: `/book-room/${roomId}`, checkIn, checkOut }
      });
    }
  };

  const handleQuickBook = () => {
    // Scroll to search section
    document.querySelector('.search-section').scrollIntoView({
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="landing-page">
        <Header />
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading available rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Header />
      <HeroSection onQuickBook={handleQuickBook} />
      <SearchSection
        checkIn={checkIn}
        setCheckIn={setCheckIn}
        checkOut={checkOut}
        setCheckOut={setCheckOut}
        roomType={roomType}
        setRoomType={setRoomType}
        onSearch={handleSearch}
      />
      <RoomsSection
        rooms={filteredRooms}
        checkIn={checkIn}
        checkOut={checkOut}
        onBookNow={handleBookNow}
      />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
