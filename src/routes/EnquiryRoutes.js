const express = require("express");
const router = express.Router();
const enquiryController = require("../controllers/EnquiryController");
const {validateEnquiry} = require("../middleware/useValidations")
const { accessTokenVerify, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/enquiry",accessTokenVerify, validateEnquiry,enquiryController.createEnquiry); // Create Enquiry
router.get("/enquiries",accessTokenVerify,authorizeRoles("admin"), enquiryController.getAllEnquiries); // Get All Enquiries
router.delete("/enquiry/:id", accessTokenVerify,authorizeRoles("admin"), enquiryController.deleteEnquiry); // Delete Enquiry

module.exports = router;
