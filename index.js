// const express = require("express");
// const app = express();
// const dotenv = require("dotenv");
// const cors = require('cors');
// dotenv.config();
// const connectdb = require("./src/config/db");
// const cookieParser = require("cookie-parser");
// const userRoutes = require("./src/routes/userRoutes");
// const propertyRoutes = require("./src/routes/PropertyRoutes");
// const enquiryRoutes = require("./src/routes/EnquiryRoutes"); // ✅ Import Enquiry Routes
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); 

// app.use(cookieParser());
// // app.use(cors({ credentials: true, origin: true })); // Allow frontend to send cookies
// const corsOptions = {
//     origin: true, 
//     credentials: true, // Allow cookies
//     // methods: ["GET", "POST", "PATCH", "DELETE"], // Restrict allowed methods
//   };
  
// app.use(cors(corsOptions));
  
// connectdb();

// app.get("/", (req, res) => {
//     res.send("Hello World!");
// });
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ status: "error", message: "Internal Server Error" });
// });
  

// app.use(userRoutes);
// app.use(propertyRoutes);
// app.use(enquiryRoutes);

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });

const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const connectdb = require("./src/config/db");
const cookieParser = require("cookie-parser");

// Import Routes
const userRoutes = require("./src/routes/userRoutes");
const propertyRoutes = require("./src/routes/PropertyRoutes");
const enquiryRoutes = require("./src/routes/EnquiryRoutes"); // ✅ Import Enquiry Routes
const bookingRoutes = require("./src/routes/BookingRoutes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: true,
  credentials: true, // Allow cookies
};
app.use(cors(corsOptions));

// Connect to Database
connectdb();

// Routes with base path
app.use("/api/auth", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("api/enquiries", enquiryRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Move this down: Error-handling middleware should be last
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: "error", message: "Internal Server Error" });
});

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
