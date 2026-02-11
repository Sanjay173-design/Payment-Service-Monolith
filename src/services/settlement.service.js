const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.settleMerchantAccount = async (accountId) => {
  // Get current balance
  const account = await pool.query("SELECT balance FROM accounts WHERE id=$1", [
    accountId,
  ]);

  if (account.rows.length === 0) return null;

  const balance = Number(account.rows[0].balance);

  if (balance <= 0) return null;

  // Create settlement record
  const settlementId = uuidv4();

  await pool.query(
    `INSERT INTO settlements (id, account_id, amount, status)
     VALUES ($1,$2,$3,$4)`,
    [settlementId, accountId, balance, "COMPLETED"],
  );

  // Reset merchant balance (simulating bank transfer)
  await pool.query("UPDATE accounts SET balance=0 WHERE id=$1", [accountId]);

  return settlementId;
};
