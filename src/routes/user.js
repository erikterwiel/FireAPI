const express = require("express");
const bottle = require("../bottle");

const router = express.Router();

router.patch("/", async (req, res) => {
  const result = await bottle.userManager.update(req.body);
  const { status, json } = result;
  res.status(status).json(json);
});

module.exports = router;
