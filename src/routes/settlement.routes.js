const express = require("express");
const router = express.Router();

const { runSettlement } = require("../controllers/settlement.controller");

router.post("/run", runSettlement);

module.exports = router;
