const kafka = require("./kafka");

const producer = kafka.producer();

exports.connectProducer = async () => {
  await producer.connect();
};

exports.sendEvent = async (topic, message) => {
  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify(message),
      },
    ],
  });
};
