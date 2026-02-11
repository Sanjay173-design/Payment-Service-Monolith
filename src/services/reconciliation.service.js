const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const gatewayService = require("./gateway.service");

exports.runAutoReconciliation = async () => {
  const payments = await pool.query(
    "SELECT * FROM payments WHERE status IN ('SUCCESS','FAILED')",
  );

  const results = [];

  for (const payment of payments.rows) {
    const gateway = await gatewayService.getGatewayPaymentStatus(
      payment.payment_ref,
    );

    if (gateway.status !== payment.status) {
      let action = "NONE";

      // SAFE AUTO FIX RULES
      if (payment.status === "SUCCESS" && gateway.status === "FAILED") {
        await pool.query("UPDATE payments SET status='FAILED' WHERE id=$1", [
          payment.id,
        ]);
        action = "DB_MARKED_FAILED";
      }

      if (payment.status === "FAILED" && gateway.status === "SUCCESS") {
        await pool.query("UPDATE payments SET status='SUCCESS' WHERE id=$1", [
          payment.id,
        ]);
        action = "DB_MARKED_SUCCESS";
      }

      // Save reconciliation report
      await pool.query(
        `INSERT INTO reconciliation_reports
         (id,payment_id,db_status,gateway_status,action_taken)
         VALUES ($1,$2,$3,$4,$5)`,
        [uuidv4(), payment.id, payment.status, gateway.status, action],
      );

      results.push({
        paymentId: payment.id,
        db: payment.status,
        gateway: gateway.status,
        action,
      });
    }
  }

  return results;
};
