const { Router } = require("express");
const router = Router();

const authRouter = require("./auth");

router.use("/auth", authRouter);

router.get("*", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = router;
