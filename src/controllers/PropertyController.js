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
      location,
      size,
      bedrooms,
      bathrooms,
      facilities,
      owner,
    } = req.body;

    // ✅ Convert city name to ObjectId
    const cityData = await City.findOne({ name: location.city });
    if (!cityData) {
      return res.status(404).json({ status: "error", message: "City  not found" });
    }
    const imagePaths = req.files.map((file) => file.filename);

    // ✅ Create the property with the correct ObjectIds
    const newProperty = new Property({
      title,
      description,
      price,
      propertyType,
      location: {
        address: location.address,
        city: cityData._id,    // Store ObjectId, not string
        // state: stateData._id,  // Store ObjectId
        // country: countryData._id, // Store ObjectId
      },
      size,
      bedrooms,
      bathrooms,
      facilities: facilities || ["Wifi", "RO", "Park"],
      propertyImages:imagePaths,
      owner,
    });

    const savedProperty = await newProperty.save();

    res.status(201).json({
      status: "success",
      message: "Property created successfully",
      data: savedProperty,
    });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// ✅ GET ALL PROPERTIES WITH PAGINATION & FILTERS
const getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      propertyType,
    } = req.query;

    let filter = {};
    if (minPrice && maxPrice) filter.price = { $gte: minPrice, $lte: maxPrice };
    if (propertyType) filter.propertyType = propertyType;

    const properties = await Property.find(filter)
      .populate("location.city location.state location.country")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: "success",
      message: "Properties fetched successfully",
      data: properties,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
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
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("Received update data:", updateData); // Debugging

    // ✅ Convert city name to ObjectId (if provided)
    if (updateData.location?.city) {
      const cityData = await City.findOne({ name: updateData.location.city });
      if (!cityData) {
        return res.status(404).json({ status: "error", message: `City '${updateData.location.city}' not found` });
      }
      updateData.location.city = cityData._id;
    }

     const updatedProperty = await Property.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProperty) {
      return res
        .status(404)
        .json({ status: "error", message: "Property not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Property updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// ✅ DELETE PROPERTY
const deleteProperty = async (req, res) => {
  try {
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
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

module.exports = {
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyById,
  getAllProperties,
};
