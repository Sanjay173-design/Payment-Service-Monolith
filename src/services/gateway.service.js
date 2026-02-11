// Fake gateway response simulator

exports.getGatewayPaymentStatus = async (paymentRef) => {
  // Simulate random gateway result
  const statuses = ["SUCCESS", "FAILED"];

  return {
    status: statuses[Math.floor(Math.random() * statuses.length)],
  };
};
