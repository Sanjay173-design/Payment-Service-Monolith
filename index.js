require("dotenv").config();
// require("./src/workers/payment.worker");
const app = require("./src/app");
const pool = require("./src/config/db");
const {
  startSettlementScheduler,
} = require("./src/schedulers/settlement.scheduler");
const { connectProducer } = require("./src/kafka/producer");
const { startConsumer } = require("./src/kafka/payment.consumer");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await pool.query("SELECT 1");
    console.log(`🚀 Server running on port ${PORT}`);
    await connectProducer();
    startConsumer();
    startSettlementScheduler();
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
});
