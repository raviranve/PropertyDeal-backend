// const express = require("express");
// const router = express.Router();
// const upload = require("../middleware/uploadFile"); 
// const {createProperty,getAllProperties, deleteProperty, updateProperty,getPropertyById} = require("../controllers/PropertyController");
// const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
// const {validateProperty} = require("../middleware/useValidations")

// router.post("/create-properties", upload.array("propertyImages", 5), authMiddleware, validateProperty, authorizeRoles("admin, seller"), createProperty);
// router.get("/get-properties", authMiddleware, validateProperty, getAllProperties);
// router.get("/get-property/:id",authMiddleware, validateProperty, getPropertyById);
// router.patch("/update-property/:id",authMiddleware, authorizeRoles("admin, seller"),validateProperty, updateProperty);
// router.delete("/delete-property/:id",authMiddleware, validateProperty,authorizeRoles("admin, seller"),deleteProperty);

// module.exports = router;


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
