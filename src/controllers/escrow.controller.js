const pool = require("../config/db");
const ledgerService = require("../services/ledger.service");

exports.releaseEscrowToMerchant = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await pool.query("SELECT * FROM payments WHERE id=$1", [
      paymentId,
    ]);

    if (!payment.rows.length) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const amount = Number(payment.rows[0].amount);

    const escrow = await pool.query(
      "SELECT id FROM accounts WHERE account_type='ESCROW' LIMIT 1",
    );

    const merchant = await pool.query(
      "SELECT id FROM accounts WHERE account_type='MERCHANT' LIMIT 1",
    );

    // Debit escrow
    await ledgerService.createLedgerEntry(
      escrow.rows[0].id,
      "DEBIT",
      amount,
      "ESCROW_RELEASE",
      paymentId,
    );

    // Credit merchant
    await ledgerService.createLedgerEntry(
      merchant.rows[0].id,
      "CREDIT",
      amount,
      "ESCROW_RELEASE",
      paymentId,
    );

    res.json({ message: "Escrow released to merchant ✅" });
  } catch (err) {
    res.status(500).json({ message: "Escrow release failed" });
  }
};
