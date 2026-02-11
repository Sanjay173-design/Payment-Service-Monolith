const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Check existing user
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = uuidv4();

    await pool.query(
      "INSERT INTO users (id, email, password_hash) VALUES ($1,$2,$3)",
      [userId, email, hashedPassword],
    );

    await pool.query(
      `INSERT INTO accounts (id, user_id, account_type, balance)
   VALUES (gen_random_uuid(), $1, 'USER', 0)`,
      [userId],
    );

    res.status(201).json({
      message: "User registered successfully 🚀",
      userId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const dbUser = user.rows[0];

    const isMatch = await bcrypt.compare(password, dbUser.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: dbUser.id, email: dbUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      message: "Login successful ✅",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
