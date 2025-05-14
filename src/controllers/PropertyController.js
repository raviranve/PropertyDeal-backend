const Property = require("../models/Property");
const City = require("../models/City");

// ✅ CREATE PROPERTY
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      propertyType,
      size,
      bedrooms,
      bathrooms,
      facilities,
      ["owner.name"]: ownerName,
      ["location.city"]: cityName,
      ["location.address"]: address,
    } = req.body;

    // ✅ Convert city name to ObjectId
    const cityData = await City.findOne({ name: cityName });
    if (!cityData) {
      return res
        .status(404)
        .json({ status: "error", message: "City  not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const imageUrls = req.files.map(
      (file) => `${baseUrl}/uploads/${file.filename}`
    );
    const facilitiesArr = facilities
      .split(",")
      .map((facility) => facility.trim());
    // ✅ Create the property with the correct ObjectIds
    const newProperty = new Property({
      title,
      description,
      price,
      propertyType,
      size,
      bedrooms,
      bathrooms,
      facilities: facilitiesArr,
      propertyImages: imageUrls,
      location: {
        address: address,
        city: cityData._id,
      },
      owner: {
        name: ownerName,
      },
    });

    const savedProperty = await newProperty.save();

    res.status(201).json({
      status: "success",
      message: "Property created successfully",
      data: savedProperty,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// ✅ GET ALL PROPERTIES WITH PAGINATION & FILTERS
const getAllProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10, propertyType } = req.query;

    let filter = {};
    if (propertyType) filter.propertyType = propertyType;

    const totalCount = await Property.countDocuments(filter); // Use filter here

    const properties = await Property.find(filter)
      .populate("location.city location.state location.country")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: "success",
      message: "Properties fetched successfully",
      data: properties,
      totalProperties: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// ✅ GET SINGLE PROPERTY
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "location.city location.state location.country"
    );
    if (!property) {
      return res
        .status(404)
        .json({ status: "error", message: "Property not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Property fetched successfully",
      data: property,
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// ✅ UPDATE PROPERTY
const updateProperty = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ status: "error", message: "Property ID is required" });
  }
  try {
    const location = JSON.parse(req.body.location);
    const owner = JSON.parse(req.body.owner);
    const facilitiesArr = JSON.parse(req.body.facilities);

    const cityData = await City.findById(location.city);
    if (!cityData) {
      return res
        .status(404)
        .json({ status: "error", message: "City not found" });
    }
    const updatedData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      propertyType: req.body.propertyType,
      size: req.body.size,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      location,
      owner,
      facilities: facilitiesArr,
    };
    // Handle file uploads
    if (req.files && req.files.length > 0) {
      updatedData.propertyImages = req.files.map(
        (file) =>
          `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
      );
    } else if (req.body.existingImages) {
      const existingImages = JSON.parse(req.body.existingImages);
      updatedData.propertyImages = existingImages;
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    res.status(200).json({
      status: "success",
      message: "Property updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      status: "error",
      message: "Update failed",
      error: error.message,
    });
  }
};

// ✅ DELETE PROPERTY
const deleteProperty = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ status: "error", message: "Property ID is required" });
  }
  try {
    const deletedProperty = await Property.findByIdAndDelete(id);
    if (!deletedProperty) {
      return res
        .status(404)
        .json({ status: "error", message: "Property not found" });
    }
    res
      .status(200)
      .json({ status: "success", message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const { propertyId, status } = req.body;
    console.log(propertyId, status);
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { status },
      { new: true }
    );
    res.status(200).json({
      status: true,
      message: "Property status updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error, booking status not updated",
      error: error.message,
    });
  }
};

module.exports = {
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyById,
  getAllProperties,
  updatePropertyStatus,
};
