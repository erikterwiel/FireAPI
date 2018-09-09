const express = require("express");
const bottle = require("../bottle");

const router = express.Router();

router.get("/signup", async (req, res) => {
  const result = await bottle.authManager.signup(req.body);
  const { status, json } = result;
  res.status(status).json(json);
});

router.get("/login", async (req, res) => {
  const result = await bottle.authManager.login(req.body);
  const { status, json } = result;
  res.status(status).json(json);
});

router.get("/verify", async (req, res) => {
  const result = await bottle.authManager.verify(req.body.token);
  const { status, json } = result;
  res.status(status).json(json);
});

module.exports = router;
