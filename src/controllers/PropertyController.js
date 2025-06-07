const Property = require("../models/Property");
const City = require("../models/City");
const fs = require("fs");
const path = require("path");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const axios = require("axios");
const Category = require("../models/Category");
const cloudinary = require("cloudinary").v2;

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
      category, // category ObjectId
      subCategory, // array of subcategory names
      ["owner.name"]: ownerName,
      ["location.city"]: cityName,
      ["location.locality"]: locality,
      ["location.lat"]: lat,
      ["location.lng"]: lng,
    } = req.body;

    // console.log(req.body);
    // Validate city
    const cityData = await City.findOne({ name: cityName });
    if (!cityData) {
      return res
        .status(404)
        .json({ status: "error", message: "City not found" });
    }

    // Validate category
    const categoryData = await Category.findById(category);
    if (!categoryData) {
      return res
        .status(404)
        .json({ status: "error", message: "Category not found" });
    }

    // Process facilities and images
    const facilityList = facilities?.split(",").map((f) => f.trim()) || [];
    const subCategories = subCategory?.split(",").map((f) => f.trim()) || [];

    // const baseUrl =
    //   process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;

    // Cloudinary image URLs
    const imageUrls = req.files?.map((file) => file.path) || [];

    const newProperty = new Property({
      title,
      description,
      price,
      propertyType,
      size,
      bedrooms,
      bathrooms,
      facilities: facilityList,
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
      category,
      subCategory: subCategories, // Save as array
    });

    const property = await newProperty.save();

    res.status(201).json({
      status: "success",
      message: "Property created successfully",
      data: property,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// ✅ GET ALL PROPERTIES
const getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { propertyType, cityId, lat, lng, search, categoryId, subCategory } =
      req.query;

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

    categoryId && (filter.category = categoryId);
    subCategory && (filter.subCategory = subCategory);

    // ✅ Total count before pagination
    const totalCount = await Property.countDocuments(filter);

    // ✅ Fetch filtered, paginated, and sorted properties
    const properties = await Property.find(filter)
      .populate("location.city")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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
      "location.city location.state location.country category"
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
      subCategory,
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

    const categoryData = await Category.findById(category);
    if (!categoryData) {
      return res
        .status(404)
        .json({ status: "error", message: "Category not found" });
    }

    const existingImagesRaw = req.body.existingImages || [];
    const existingImages = Array.isArray(existingImagesRaw)
      ? existingImagesRaw
      : [existingImagesRaw];

    // ✅ Delete removed images from Cloudinary
    const removedImages = property.propertyImages.filter(
      (url) => !existingImages.includes(url)
    );

    for (const imageUrl of removedImages) {
      const parts = imageUrl.split("/");
      const filenameWithExt = parts[parts.length - 1];
      const publicId = `uploads/${filenameWithExt.split(".")[0]}`;

      await cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.warn("Failed to delete Cloudinary image:", publicId, error.message);
        } else {
          console.log("Deleted Cloudinary image:", publicId);
        }
      });
    }

    const uploadedImages = req.files?.map((file) => file.path) || [];

    const subCategories = subCategory?.split(",").map((f) => f.trim()) || [];
    const facilitiesArr = facilities.split(",").map((f) => f.trim());

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
    property.subCategory = subCategories;

    const updated = await property.save();

    res.status(200).json({
      status: "success",
      message: "Property updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating property:", err);
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

    // Delete images from Cloudinary
    if (Array.isArray(deletedProperty.propertyImages)) {
      for (const imageUrl of deletedProperty.propertyImages) {
        // Extract public_id from the Cloudinary URL
        const parts = imageUrl.split("/");
        const filenameWithExt = parts[parts.length - 1]; // e.g., "abc123.jpg"
        const publicId = `uploads/${filenameWithExt.split(".")[0]}`; // e.g., "uploads/abc123"

        await cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.warn("Failed to delete Cloudinary image:", publicId, error.message);
          } else {
            console.log("Cloudinary image deleted:", publicId);
          }
        });
      }
    }

    res.status(200).json({
      status: "success",
      message: "Property and associated images deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};


// ✅ UPDATE PROPERTY STATUS
const updatePropertyStatus = async (req, res) => {
  try {
    const { propertyId, status } = req.body;
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
