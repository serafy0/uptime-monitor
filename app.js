const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server is running on port ${port}`));

module.exports = { app };
