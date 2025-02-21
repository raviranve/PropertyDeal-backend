const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
    name: { type: String },
    stateCode: { type: String },
    countryCode: { type: String },
    latitude: { type: String },
    longitude: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("City", citySchema);
