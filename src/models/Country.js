const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
    name: { type: String },
    isoCode: { type: String },
    flag: { type: String },
    phoneCode: { type: String },
    latitude: { type: String },
    longitude: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Country", countrySchema);
