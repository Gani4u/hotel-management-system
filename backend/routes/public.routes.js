const express = require('express');
const publicController = require('../controllers/public.controller');

const router = express.Router();

// Public endpoints - No authentication required
router.get('/rooms', publicController.getAvailableRooms);
router.get('/rooms/:roomId', publicController.getRoomDetails);
router.get('/search', publicController.searchRooms);

module.exports = router;
