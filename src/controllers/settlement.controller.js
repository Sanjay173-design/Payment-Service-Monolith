const pool = require("../config/db");
const settlementService = require("../services/settlement.service");

exports.runSettlement = async (req, res) => {
  try {
    const merchantAccounts = await pool.query(
      "SELECT id FROM accounts WHERE account_type='MERCHANT'",
    );

    const results = [];

    for (const acc of merchantAccounts.rows) {
      const settlementId = await settlementService.settleMerchantAccount(
        acc.id,
      );

      if (settlementId) {
        results.push({
          accountId: acc.id,
          settlementId,
        });
      }
    }

    res.json({
      message: "Settlement completed 🏦",
      settlements: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Settlement error",
    });
  }
};
