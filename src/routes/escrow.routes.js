const express = require("express");
const router = express.Router();

const { releaseEscrowToMerchant } = require("../controllers/escrow.controller");

router.post("/release", releaseEscrowToMerchant);

module.exports = router;
