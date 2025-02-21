const mongoose = require("mongoose");
// const { Country, State, City } = require("country-state-city");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Get Madhya Pradesh state details
    // const mpState = State.getStateByCodeAndCountry("MP", "IN");

    // if (!mpState) {
    //   console.log("Madhya Pradesh state not found.");
    //   return;
    // }

    // Filter cities for Madhya Pradesh
    // const mpCities = City.getAllCities().filter(city => city.stateCode === "MP" && city.countryCode === "IN");

    // const cityCollection = mongoose.connection.db.collection("cities");

    // if (mpCities.length > 0) {
    //   await cityCollection.insertMany(mpCities);
    //   console.log("Madhya Pradesh cities inserted successfully");
    // } else {
    //   console.log("No cities found for Madhya Pradesh.");
    // }
  } catch (error) {
    console.log("Error inserting data:", error);
    process.exit(1);
  }
};

module.exports = connectDb;
