const reconciliationService = require("../services/reconciliation.service");

exports.runReconciliation = async (req, res) => {
  try {
    const results = await reconciliationService.runAutoReconciliation();

    res.json({
      message: "Reconciliation completed 🔍",
      mismatches: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Reconciliation failed",
    });
  }
};
