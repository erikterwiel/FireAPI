const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
const bottle = require("./bottle");

const fireRoutes = require("./routes/fire");
const authRoutes = require("./routes/auth");

const app = express();

mongoose.connect(`mongodb://${process.env.DOMAIN || "localhost:27017"}/fire`, { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/fire", fireRoutes);
app.use("/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const port = process.env.PORT || 5000;
app.set("port", port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));

bottle.fireManager.initialize();
