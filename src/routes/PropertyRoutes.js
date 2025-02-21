const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadFile"); 
const {createProperty,getAllProperties, deleteProperty, updateProperty,getPropertyById} = require("../controllers/PropertyController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const {validateProperty} = require("../middleware/useValidations")

router.post("/create-properties", upload.array("propertyImages", 5), authMiddleware, validateProperty, authorizeRoles("admin, seller"), createProperty);
router.get("/get-properties", authMiddleware, validateProperty, getAllProperties);
router.get("/get-property/:id",authMiddleware, validateProperty, getPropertyById);
router.patch("/update-property/:id",authMiddleware, authorizeRoles("admin, seller"),validateProperty, updateProperty);
router.delete("/delete-property/:id",authMiddleware, validateProperty,authorizeRoles("admin, seller"),deleteProperty);

module.exports = router;
