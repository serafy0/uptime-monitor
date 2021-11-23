const { Router } = require("express");
const router = Router();
require("dotenv").config();

const protect = require("../middleware/auth");
const { addCheck, pauseCheck } = require("../controllers/check");

router.route("/checkURL").post(protect, addCheck);
router.route("/pause").post(protect, pauseCheck);
module.exports = router;
