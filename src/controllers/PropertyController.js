const Property = require("../models/Property");
const City = require("../models/City");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const axios = require("axios");

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
      category,
      ["owner.name"]: ownerName,
      ["location.city"]: cityName,
      ["location.locality"]: locality,
      ["location.lat"]: lat,
      ["location.lng"]: lng,
    } = req.body;
    console.log(req.body);
    const cityData = await City.findOne({ name: cityName });
    if (!cityData) {
      return res
        .status(404)
        .json({ status: "error", message: "City not found" });
    }

    const facilityList = facilities.split(",").map((f) => f.trim());
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrls = req.files.map(
      (file) => `${baseUrl}/uploads/${file.filename}`
    );
    console.log(facilityList);
    const newProperty = new Property({
      title,
      description,
      price,
      propertyType,
      size,
      bedrooms,
      bathrooms,
      facilities: facilityList,
      category,
      propertyImages: imageUrls,
      location: {
        city: cityData._id,
        locality,
        lat,
        lng,
      },
      owner: {
        name: ownerName,
      },
    });

    const property = await newProperty.save();
    res.status(201).json({
      status: "success",
      message: "Property created Successfully",
      data: property,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// ✅ GET ALL PROPERTIES WITH PAGINATION & FILTERS
const getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const {
      propertyType,
      cityId,
      lat,
      lng,
      search,
      minPrice,
      maxPrice,
      sortBy = "createdAt", // default sort by creation date
      sortOrder = "desc", // default descending order
    } = req.query;

    let filter = {};

    // 📌 Filter by property type
    if (propertyType) filter.propertyType = propertyType;

    // 📌 Filter by city ID
    if (cityId) filter["location.city"] = cityId;

    // 📌 Lat/lng filter
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      filter["location.lat"] = latNum;
      filter["location.lng"] = lngNum;
    }

    // 📌 Search by title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 📌 Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // 📌 Sorting logic
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // ✅ Total count before pagination
    const totalCount = await Property.countDocuments(filter);

    // ✅ Fetch filtered, paginated, and sorted properties
    const properties = await Property.find(filter)
      .populate("location.city")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortOptions)
      .lean();

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
    console.error("Error in getAllProperties:", error);
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
    const {
      title,
      description,
      price,
      propertyType,
      size,
      bedrooms,
      bathrooms,
      facilities,
      category,
      ["owner.name"]: ownerName,
      ["location.city"]: cityName,
      ["location.locality"]: locality,
      ["location.lat"]: lat,
      ["location.lng"]: lng,
    } = req.body;

    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) {
      return res
        .status(404)
        .json({ status: "error", message: "Property not found" });
    }

    const cityData = await City.findOne({ name: cityName });
    if (!cityData) {
      return res
        .status(404)
        .json({ status: "error", message: "City not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const uploadedImages = req.files.map(
      (file) => `${baseUrl}/uploads/${file.filename}`
    );
    const existingImages = req.body.existingImages || [];

    const facilitiesArr = facilities.split(",").map((f) => f.trim());

    // Update fields
    property.title = title;
    property.description = description;
    property.price = price;
    property.propertyType = propertyType;
    property.size = size;
    property.bedrooms = bedrooms;
    property.bathrooms = bathrooms;
    property.facilities = facilitiesArr;
    property.propertyImages = [...existingImages, ...uploadedImages];
    property.owner.name = ownerName;
    property.location = {
      city: cityData._id,
      locality,
      lat,
      lng,
    };
    property.category = category;

    const updated = await property.save();
    res.status(200).json({
      status: "success",
      message: "Property updated Successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Internal Server Error" });
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

// ✅ UPDATE PROPERTY STATUS
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

// ✅ GET LOCATION FROM GOOGLE MAPS
const getLocationFromGoogleMaps = async (req, res) => {
  const { placeId } = req.query;

  if (!placeId) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing placeId" });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          key: GOOGLE_MAPS_API_KEY,
          fields: "geometry",
        },
      }
    );

    const result = response.data.result;
    if (!result?.geometry?.location) {
      return res
        .status(404)
        .json({ status: "error", message: "Location not found" });
    }

    res.json({ result });
  } catch (error) {
    console.error("Google Maps API Error:", error.message);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch place details" });
  }
};

module.exports = {
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyById,
  getAllProperties,
  updatePropertyStatus,
  getLocationFromGoogleMaps,
};
