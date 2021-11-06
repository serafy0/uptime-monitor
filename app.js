const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv").config();
const router = require("./routes");
const cookieParser = require("cookie-parser");
const connectMongoDB = require("./db/mongodb");
const errorHandler = require("./middleware/errorHandler");

const app = express();
connectMongoDB();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(router);
app.use(errorHandler);

let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server is running on port ${port}`));

module.exports = { app };
