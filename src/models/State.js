const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
    name: { type: String },
    isoCode: { type: String },
    countryCode: { type: String },
    latitude: { type: String},
    longitude: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("State", stateSchema);
