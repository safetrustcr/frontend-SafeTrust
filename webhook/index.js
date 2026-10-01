const express = require("express");
const app = express();

app.use(express.json());
app.use("/api/auth", require("./wallet-auth"));

module.exports = app;
