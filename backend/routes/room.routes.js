const express = require("express");
const roomController = require("../controllers/room.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware(["admin", "staff"]), roomController.getAllRooms);
router.post("/", authMiddleware("admin"), roomController.createRoom);
router.put("/:id", authMiddleware("admin"), roomController.updateRoom);
router.delete("/:id", authMiddleware("admin"), roomController.deleteRoom);

module.exports = router;
