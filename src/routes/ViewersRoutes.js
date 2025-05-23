const express = require("express");
const router = express.Router();
const ViewerController = require("../controllers/PropertyViewersController");

router.post("/track-viewers", ViewerController.trackViewers);
router.get("/get-viewers", ViewerController.getViewersCount);

module.exports = router;
