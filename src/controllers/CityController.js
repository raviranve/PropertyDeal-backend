const City = require("../models/City"); 

// Fetch all cities (optionally filter by countryCode or stateCode)
exports.getAllCities = async (req, res) => {
  try {
    // const { countryCode, stateCode } = req.query;

    // If you want to filter by countryCode or stateCode, uncomment the following lines
    // const query = {};
    // if (countryCode) query.countryCode = countryCode;
    // if (stateCode) query.stateCode = stateCode;

    const cities = await City.find();
    if (!cities || cities.length === 0) {
      return res.status(404).json({ success: false, message: "No cities found" });
    }
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    console.error("City fetch error:", error);  // <-- This is what you'll see in console
    res.status(500).json({ success: false, message: "server error,something went wrong " });
  }
};

