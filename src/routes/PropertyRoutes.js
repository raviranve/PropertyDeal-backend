const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadFile");
const PropertyController = require("../controllers/PropertyController");
const {
  accessTokenVerify,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  validateProperty,
  validateUpdateProperty,
} = require("../middleware/useValidations");
const handleMulterErrors = require("../middleware/multerValidation");

// router.post(
//   "/create-properties",
//   handleMulterErrors,
//   upload.array("propertyImages", 10),
//   accessTokenVerify,
//   validateProperty,
//   authorizeRoles("admin", "seller"),
//   PropertyController.createProperty
// );

router.post(
  "/create-properties",
  handleMulterErrors, // This wraps Multer + error handling
  accessTokenVerify,
  validateProperty,
  authorizeRoles("admin", "seller"),
  PropertyController.createProperty
);

router.get("/get-properties", PropertyController.getAllProperties);
router.get("/get-property/:id", PropertyController.getPropertyById);
router.patch(
  "/update-property/:id",
  handleMulterErrors,
  accessTokenVerify,
  authorizeRoles("admin", "seller"),
  validateUpdateProperty,
  PropertyController.updateProperty
);
router.delete(
  "/delete-property/:id",
  accessTokenVerify,
  authorizeRoles("admin"),
  PropertyController.deleteProperty
);
router.patch(
  "/update-status",
  accessTokenVerify,
  authorizeRoles("admin"),
  PropertyController.updatePropertyStatus
);

router.get("/place-details", PropertyController.getLocationFromGoogleMaps);

module.exports = router;
