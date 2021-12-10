const { Router } = require("express");
const router = Router();

const authRouter = require("./auth");
const checkRouter = require("./check");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");

router.use("/auth", authRouter);
router.use("/check", checkRouter);

router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerDocument));
router.get("*", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = router;
