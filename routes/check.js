const { Router } = require("express");
const router = Router();
require("dotenv").config();

const protect = require("../middleware/auth");
const {
  addCheck,
  pauseCheck,
  getOneCheck,
  editCheck,
  deleteCheck,
  findByTag,
  getReportForCheck,
  resumeCheck,
} = require("../controllers/check");

router.route("/").post(protect, addCheck);
router.route("/pause/:id").post(protect, pauseCheck);
router.route("/resume/:id").post(protect, resumeCheck);
router.route("/:id").get(protect, getOneCheck);
router.route("/:id").patch(protect, editCheck);
router.route("/:id").delete(protect, deleteCheck);
router.route("/tag/:tag").get(protect, findByTag);
router.route("/report/:id").get(protect, getReportForCheck);
module.exports = router;
