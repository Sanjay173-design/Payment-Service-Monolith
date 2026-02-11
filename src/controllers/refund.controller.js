const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const ledgerService = require("../services/ledger.service");

exports.createRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId || !amount) {
      return res.status(400).json({
        message: "paymentId and amount required",
      });
    }

    // Get payment
    const paymentResult = await pool.query(
      "SELECT * FROM payments WHERE id=$1",
      [paymentId],
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const payment = paymentResult.rows[0];

    // Only allow refund if payment success
    if (payment.status !== "SUCCESS") {
      return res.status(400).json({
        message: "Only successful payments can be refunded",
      });
    }

    // Calculate already refunded amount
    const refundSum = await pool.query(
      "SELECT COALESCE(SUM(amount),0) as total FROM refunds WHERE payment_id=$1",
      [paymentId],
    );

    const alreadyRefunded = Number(refundSum.rows[0].total);
    const remaining = Number(payment.amount) - alreadyRefunded;

    if (amount > remaining) {
      return res.status(400).json({
        message: "Refund exceeds remaining amount",
        remainingAmount: remaining,
      });
    }

    const refundId = uuidv4();

    await pool.query(
      `INSERT INTO refunds
       (id,payment_id,amount,reason,status)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        refundId,
        paymentId,
        amount,
        reason || "Customer request",
        "SUCCESS", // Simulated success
      ],
    );

    // Debit merchant account
    const merchantAccount = await pool.query(
      "SELECT id FROM accounts WHERE account_type='MERCHANT' LIMIT 1",
    );

    if (merchantAccount.rows.length > 0) {
      await ledgerService.createLedgerEntry(
        merchantAccount.rows[0].id,
        "DEBIT",
        amount,
        "REFUND",
        refundId,
      );
    }

    // Update payment status if fully refunded
    if (amount === remaining) {
      await pool.query("UPDATE payments SET status='REFUNDED' WHERE id=$1", [
        paymentId,
      ]);
    }

    res.json({
      message: "Refund processed 💸",
      refundId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Refund server error",
    });
  }
};
