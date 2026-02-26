const pool = require('../config/db');

exports.getAllRooms = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rooms] = await connection.query('SELECT id, room_number, type, price, status FROM rooms');
    connection.release();

    res.status(200).json({
      message: 'Rooms retrieved successfully',
      data: rooms,
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerNight } = req.body;

    if (!roomNumber || !roomType || !pricePerNight) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const connection = await pool.getConnection();

    const [existingRoom] = await connection.query(
      'SELECT id FROM rooms WHERE room_number = ?',
      [roomNumber]
    );

    if (existingRoom.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Room number already exists' });
    }

    const [result] = await connection.query(
      'INSERT INTO rooms (room_number, type, price, status) VALUES (?, ?, ?, ?)',
      [roomNumber, roomType, pricePerNight, 'available']
    );

    connection.release();

    res.status(201).json({
      message: 'Room created successfully',
      roomId: result.insertId,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, type, price, status } = req.body;

    const connection = await pool.getConnection();

    const [rooms] = await connection.query(
      'SELECT id FROM rooms WHERE id = ?',
      [id]
    );

    if (rooms.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Room not found' });
    }

    const fields = [];
    const values = [];

    if (roomNumber !== undefined) {
      fields.push('room_number = ?');
      values.push(roomNumber);
    }
    if (type !== undefined) {
      fields.push('type = ?');
      values.push(type);
    }
    if (price !== undefined) {
      fields.push('price = ?');
      values.push(price);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }

    if (fields.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);

    await connection.query(
      `UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    connection.release();

    res.status(200).json({ message: 'Room updated successfully' });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();

    const [rooms] = await connection.query(
      'SELECT id FROM rooms WHERE id = ?',
      [id]
    );

    if (rooms.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Room not found' });
    }

    await connection.query('DELETE FROM rooms WHERE id = ?', [id]);

    connection.release();

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
