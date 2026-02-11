const cron = require("node-cron");
const pool = require("../config/db");
const settlementService = require("../services/settlement.service");

exports.startSettlementScheduler = () => {
  // Runs everyday at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("⏰ Running Auto Settlement Job...");

    try {
      const merchantAccounts = await pool.query(
        "SELECT id FROM accounts WHERE account_type='MERCHANT'",
      );

      for (const acc of merchantAccounts.rows) {
        await settlementService.settleMerchantAccount(acc.id);
      }

      console.log("✅ Auto Settlement Completed");
    } catch (err) {
      console.error("❌ Settlement Cron Error:", err.message);
    }
  });
};
