const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadFile"); 
const PropertyController = require("../controllers/PropertyController");
const { accessTokenVerify, authorizeRoles } = require("../middleware/authMiddleware");
const {validateProperty} = require("../middleware/useValidations")

router.post("/create-properties", upload.array("propertyImages", 5), accessTokenVerify, validateProperty, authorizeRoles("admin, seller"), PropertyController.createProperty);
router.get("/get-properties", accessTokenVerify, validateProperty, PropertyController.getAllProperties);
router.get("/get-property/:id",accessTokenVerify, validateProperty, PropertyController.getPropertyById);
router.patch("/update-property/:id",accessTokenVerify, authorizeRoles("admin, seller"),validateProperty, PropertyController.updateProperty);
router.delete("/delete-property/:id",accessTokenVerify, validateProperty,authorizeRoles("admin, seller"),PropertyController.deleteProperty);

module.exports = router;
