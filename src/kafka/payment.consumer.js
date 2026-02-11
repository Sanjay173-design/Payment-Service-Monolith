const kafka = require("./kafka");

const consumer = kafka.consumer({
  groupId: "payment-group",
});

exports.startConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topic: "payment-events",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value.toString());

      console.log("\n==============================");
      console.log("🔥🔥 KAFKA EVENT RECEIVED 🔥🔥");
      console.log("Topic:", topic);
      console.log("Partition:", partition);
      console.log("Payload:", data);
      console.log("==============================\n");
    },
  });
};
