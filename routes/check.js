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
  findByTag,
} = require("../controllers/check");

router.route("/checkURL").post(protect, addCheck);
router.route("/pause").post(protect, pauseCheck);
router.route("/all").get(getAllJobs);
router.route("/all/remove").get(removeAllJobs);
router.route("/:id").get(protect, getOneCheck);
router.route("/:id").patch(protect, editCheck);
router.route("/:id").delete(protect, deleteCheck);
router.route("/tag/:tag").get(protect, findByTag);
module.exports = router;
