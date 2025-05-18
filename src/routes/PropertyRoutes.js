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

router.post(
  "/create-properties",
  upload.array("propertyImages", 10),
  accessTokenVerify,
  validateProperty,
  authorizeRoles("admin", "seller"),
  PropertyController.createProperty
);
router.get(
  "/get-properties",
  accessTokenVerify,
  PropertyController.getAllProperties
);
router.get(
  "/get-property/:id",
  accessTokenVerify,
  PropertyController.getPropertyById
);
router.patch(
  "/update-property/:id",
  upload.array("propertyImages", 5),
  accessTokenVerify,
  authorizeRoles("admin", "seller"),
  validateUpdateProperty,
  PropertyController.updateProperty
);
router.delete(
  "/delete-property/:id",
  accessTokenVerify,
  authorizeRoles("admin", "seller"),
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
