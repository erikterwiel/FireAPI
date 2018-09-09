const express = require("express");
const bottle = require("../bottle");

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await bottle.fireManager.getAllFires();
  const { status, json } = result;
  res.status(status).json(json);
});

router.post("/", async (req, res) => {
  const result = await bottle.fireManager.reportFire(req.body);
  const { status, json } = result;
  res.status(status).json(json);
});

module.exports = router;
