const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.createLedgerEntry = async (
  accountId,
  entryType,
  amount,
  referenceType,
  referenceId,
) => {
  await pool.query(
    `INSERT INTO ledger_entries
     (id, account_id, entry_type, amount, reference_type, reference_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [uuidv4(), accountId, entryType, amount, referenceType, referenceId],
  );

  // Update balance
  if (entryType === "CREDIT") {
    await pool.query("UPDATE accounts SET balance = balance + $1 WHERE id=$2", [
      amount,
      accountId,
    ]);
  } else {
    await pool.query("UPDATE accounts SET balance = balance - $1 WHERE id=$2", [
      amount,
      accountId,
    ]);
  }
};
