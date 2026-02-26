const express = require('express');
const roomController = require('../controllers/room.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, roomController.getAllRooms);
router.post('/', authMiddleware, roomController.createRoom);
router.put('/:id', authMiddleware, roomController.updateRoom);
router.delete('/:id', authMiddleware, roomController.deleteRoom);

module.exports = router;
