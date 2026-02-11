const express = require("express");
const router = express.Router();

const {
  runReconciliation,
} = require("../controllers/reconciliation.controller");

router.post("/run", runReconciliation);

module.exports = router;
