const express = require("express");
const router = express.Router();
const enquiryController = require("../controllers/EnquiryController");
const {validateEnquiry} = require("../middleware/useValidations")
const { accessTokenVerify, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/enquiry", validateEnquiry,enquiryController.createEnquiry);
router.get("/enquiries",accessTokenVerify,authorizeRoles("admin"), enquiryController.getAllEnquiries);
router.delete("/enquiry/:id", accessTokenVerify,authorizeRoles("admin"), enquiryController.deleteEnquiry);

module.exports = router;
