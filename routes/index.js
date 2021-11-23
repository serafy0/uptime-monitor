const { Router } = require("express");
const router = Router();

const authRouter = require("./auth");
const checkRouter = require("./check");

router.use("/auth", authRouter);
router.use("/check", checkRouter);

router.get("*", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = router;
