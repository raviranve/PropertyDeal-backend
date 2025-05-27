const express = require("express");
const router = express.Router();
const Cities= require("../controllers/CityController"); 

router.get("/get-cities", Cities.getAllCities);

module.exports = router;
