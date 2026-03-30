import { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/pages.css';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: '',
    pricePerNight: '',
    capacity: '',
    description: '',
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await API.get('/rooms');
      setRooms(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (!isAdmin) {
      setError('Only admins can manage rooms');
      return;
    }

    setEditingId(null);
    setFormData({
      roomNumber: '',
      roomType: '',
      pricePerNight: '',
      capacity: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleEditRoom = (room) => {
    if (!isAdmin) {
      setError('Only admins can manage rooms');
      return;
    }

    setEditingId(room.id);
    setFormData({
      roomNumber: room.room_number,
      roomType: room.type,
      pricePerNight: room.price,
      capacity: room.capacity || '',
      description: room.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      setError('Only admins can manage rooms');
      return;
    }

    try {
      if (editingId) {
        await API.put(`/rooms/${editingId}`, {
          roomNumber: formData.roomNumber,
          type: formData.roomType,
          price: formData.pricePerNight,
          status: 'available',
        });
      } else {
        await API.post('/rooms', {
          roomNumber: formData.roomNumber,
          roomType: formData.roomType,
          pricePerNight: formData.pricePerNight,
        });
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setError('Only admins can manage rooms');
      return;
    }

    if (window.confirm('Are you sure?')) {
      try {
        await API.delete(`/rooms/${id}`);
        fetchRooms();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Loading rooms...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Rooms Management</h1>
        {isAdmin && (
          <button onClick={handleOpenModal} className="btn-primary">+ Add Room</button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Type</th>
              <th>Price/Night</th>
              <th>Capacity</th>
              <th>Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.room_number}</td>
                <td>{room.type}</td>
                <td>${room.price}</td>
                <td>{room.capacity || '-'}</td>
                <td><span className={`status-badge status-${room.status}`}>{room.status}</span></td>
                {isAdmin && (
                  <td>
                    <button onClick={() => handleEditRoom(room)} className="btn-small btn-edit">Edit</button>
                    <button onClick={() => handleDelete(room.id)} className="btn-small btn-danger">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Room' : 'Create Room'}</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Room Number"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Room Type"
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price Per Night"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
              <button type="submit" className="btn-primary">Save Room</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
