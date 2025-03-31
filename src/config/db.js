const mongoose = require("mongoose");
// const { Country, State, City } = require("country-state-city");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error inserting data:", error);
    process.exit(1);
  }
};

module.exports = connectDb;
