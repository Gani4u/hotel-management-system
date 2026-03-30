const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const VALID_ROLES = ["admin", "staff", "customer"];

const normalizeName = (body = {}) => {
  if (body.name && String(body.name).trim()) {
    return String(body.name).trim();
  }

  return [body.firstName, body.lastName].filter(Boolean).join(" ").trim();
};

exports.registerUser = async (req, res) => {
  try {
    const { email, password, phone, confirmPassword } = req.body;
    const name = normalizeName(req.body);
    const role = req.body.role || "customer";

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const connection = await pool.getConnection();

    try {
      const [existing] = await connection.query(
        "SELECT id FROM users WHERE email = ?",
        [email],
      );

      if (existing.length > 0) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await connection.query(
        "INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, role, phone || null],
      );

      return res.status(201).json({
        message: "User registered successfully",
        userId: result.insertId,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const connection = await pool.getConnection();

    try {
      const [users] = await connection.query(
        "SELECT id, name, email, password, role, phone FROM users WHERE email = ?",
        [email],
      );

      if (users.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (portal === "customer" && user.role !== "customer") {
        return res.status(403).json({
          message: "This account is not allowed in the customer portal",
        });
      }

      if (portal === "staff" && !["admin", "staff"].includes(user.role)) {
        return res.status(403).json({
          message: "This account is not allowed in the staff portal",
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
