const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.createPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, currency } = req.body;

    const idempotencyKey = req.headers["idempotency-key"];

    if (!idempotencyKey) {
      return res
        .status(400)
        .json({ message: "Idempotency-Key header required" });
    }

    // Check existing payment
    const existingPayment = await pool.query(
      "SELECT * FROM payments WHERE idempotency_key=$1",
      [idempotencyKey],
    );

    if (existingPayment.rows.length > 0) {
      return res.json({
        message: "Existing payment returned (Idempotent) ✅",
        payment: existingPayment.rows[0],
      });
    }

    const paymentId = uuidv4();
    const paymentRef = "PAY_" + Date.now();

    const newPayment = await pool.query(
      `INSERT INTO payments
       (id,user_id,amount,currency,status,payment_ref,idempotency_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        paymentId,
        userId,
        amount,
        currency || "INR",
        "PENDING",
        paymentRef,
        idempotencyKey,
      ],
    );

    res.status(201).json({
      message: "Payment created 🚀",
      payment: newPayment.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;

    const payment = await pool.query("SELECT * FROM payments WHERE id=$1", [
      paymentId,
    ]);

    if (payment.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { status, gatewayResponse } = req.body;

    await pool.query("UPDATE payments SET status=$1 WHERE id=$2", [
      status,
      paymentId,
    ]);

    // Log transaction
    await pool.query(
      `INSERT INTO transactions (id,payment_id,gateway_response,status)
       VALUES ($1,$2,$3,$4)`,
      [uuidv4(), paymentId, gatewayResponse || {}, status],
    );

    res.json({ message: "Payment updated ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
