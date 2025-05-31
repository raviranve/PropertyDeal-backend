const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const connectdb = require("./src/config/db");
const cookieParser = require("cookie-parser");
const path = require("path");

// Import Routes
const userRoutes = require("./src/routes/UserRoutes");
const propertyRoutes = require("./src/routes/PropertyRoutes");
const enquiryRoutes = require("./src/routes/EnquiryRoutes");
const bookingRoutes = require("./src/routes/BookingRoutes");
const cityRoutes = require("./src/routes/CityRoutes");
const categoryRoutes = require("./src/routes/CategoryRoutes");
const viewerRoutes = require("./src/routes/ViewersRoutes");

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

const corsOptions = {
   origin: [
    "https://propertydeal0.netlify.app",
    "http://localhost:5173",            
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to Database
connectdb();

app.use("/api/auth", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/enquiries", enquiryRoutes); 
app.use("/api/cities", cityRoutes); 
app.use("/api/categories", categoryRoutes);
app.use("/api/viewers", viewerRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ✅ Error-handling middleware should be last
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ status: "error", message: "Internal Server Error" });
});

// ✅ Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});