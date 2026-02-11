const crypto = require("crypto");
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const ledgerService = require("../services/ledger.service");
const feePercent = Number(process.env.PLATFORM_FEE_PERCENT || 2);
// const paymentQueue = require("../queues/payment.queue");
const { sendEvent } = require("../kafka/producer");

exports.handlePaymentWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];

    const payload = JSON.stringify(req.body);

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Example webhook payload
    // {
    //   paymentRef: "PAY_123",
    //   status: "SUCCESS"
    // }

    const { paymentRef, status, gatewayData } = req.body;

    const payment = await pool.query(
      "SELECT * FROM payments WHERE payment_ref=$1",
      [paymentRef],
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const paymentId = payment.rows[0].id;

    // Update payment
    await pool.query("UPDATE payments SET status=$1 WHERE id=$2", [
      status,
      paymentId,
    ]);

    // ONLY IF SUCCESS
    if (status === "SUCCESS") {
      const paymentAmount = Number(payment.rows[0].amount);

      // EVENT DRIVEN → SEND TO QUEUE
      //   await paymentQueue.add("payment-success", {
      //     paymentId: paymentId,
      //     amount: paymentAmount,
      //     paymentRef: paymentRef,
      //   });

      //   console.log("📬 Payment event pushed to queue");

      const escrowAccount = await pool.query(
        "SELECT id FROM accounts WHERE account_type='ESCROW' LIMIT 1",
      );

      if (escrowAccount.rows.length > 0) {
        await ledgerService.createLedgerEntry(
          escrowAccount.rows[0].id,
          "CREDIT",
          paymentAmount,
          "PAYMENT_ESCROW",
          paymentId,
        );
      }

      await sendEvent("payment-events", {
        eventType: "PAYMENT_SUCCESS",
        paymentId: paymentId,
        paymentRef: paymentRef,
        amount: payment.rows[0].amount,
        timestamp: new Date().toISOString(),
      });
    }

    if (status === "SUCCESS") {
      const paymentAmount = Number(payment.rows[0].amount);

      const feeAmount = (paymentAmount * feePercent) / 100;
      const merchantNet = paymentAmount - feeAmount;

      // Get merchant account
      const merchantAccount = await pool.query(
        "SELECT id FROM accounts WHERE account_type='MERCHANT' LIMIT 1",
      );

      // Get system account
      const systemAccount = await pool.query(
        "SELECT id FROM accounts WHERE account_type='SYSTEM' LIMIT 1",
      );

      if (merchantAccount.rows.length > 0 && systemAccount.rows.length > 0) {
        // Merchant gets net amount
        await ledgerService.createLedgerEntry(
          merchantAccount.rows[0].id,
          "CREDIT",
          merchantNet,
          "PAYMENT",
          paymentId,
        );

        // Platform gets fee
        await ledgerService.createLedgerEntry(
          systemAccount.rows[0].id,
          "CREDIT",
          feeAmount,
          "FEE",
          paymentId,
        );
      }
    }

    // Insert transaction log
    await pool.query(
      `INSERT INTO transactions
       (id,payment_id,gateway_response,status)
       VALUES ($1,$2,$3,$4)`,
      [uuidv4(), paymentId, gatewayData || {}, status],
    );

    res.json({ message: "Webhook processed ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Webhook server error" });
  }
};
