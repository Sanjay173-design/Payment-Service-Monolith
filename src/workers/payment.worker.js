// const { Worker } = require("bullmq");
// const ledgerService = require("../services/ledger.service");

// const connection = {
//   host: "127.0.0.1",
//   port: 6379,
// };

// const worker = new Worker(
//   "paymentQueue",
//   async (job) => {
//     if (job.name === "payment-success") {
//       console.log("Processing payment event:", job.data);

//       // Example: Ledger update here async
//       // Later you can call full ledger + fee + escrow logic
//     }
//   },
//   { connection },
// );

// worker.on("completed", (job) => {
//   console.log(`Job ${job.id} completed`);
// });
