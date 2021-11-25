const { Router } = require("express");
const router = Router();
require("dotenv").config();

const protect = require("../middleware/auth");
const {
  addCheck,
  getAllJobs,
  pauseCheck,
  removeAllJobs,
  getOneCheck,
  editCheck,
  deleteCheck,
} = require("../controllers/check");

router.route("/checkURL").post(protect, addCheck);
router.route("/pause").post(protect, pauseCheck);
router.route("/all").get(getAllJobs);
router.route("/all/remove").get(removeAllJobs);
router.route("/:id").get(getOneCheck);
router.route("/:id").patch(editCheck);
router.route("/:id").delete(deleteCheck);
module.exports = router;
