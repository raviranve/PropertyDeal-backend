// const express = require("express");
// const app = express();
// const dotenv = require("dotenv");
// const cors = require("cors");
// const http = require('http');
// const { Server } = require('socket.io');
// const chatSocket = require('./src/socket/ChatSocket');
// dotenv.config();
// const connectdb = require("./src/config/db");
// const cookieParser = require("cookie-parser");
// const path = require("path");

// // Import Routes
// const userRoutes = require("./src/routes/UserRoutes");
// const propertyRoutes = require("./src/routes/PropertyRoutes");
// const enquiryRoutes = require("./src/routes/EnquiryRoutes");
// const bookingRoutes = require("./src/routes/BookingRoutes");
// const cityRoutes = require("./src/routes/CityRoutes");
// const categoryRoutes = require("./src/routes/CategoryRoutes");
// const viewerRoutes = require("./src/routes/ViewersRoutes");
// const messageRoutes = require('./src/routes/MessageRoutes');


// // Middleware for parsing JSON and URL-encoded data
// app.use(express.json);
// app.use(express.urlencoded({ extended: true}));
// app.use(cookieParser());

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: '*'
//   }
// });

// chatSocket(io);


// const corsOptions = {
//    origin: [
//     "https://propertydeal0.netlify.app",
//     "http://localhost:5173",            
//   ],
//   credentials: true,
// };
// app.use(cors(corsOptions));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Connect to Database
// connectdb();

// app.use("/api/auth", userRoutes);
// app.use("/api/properties", propertyRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/enquiries", enquiryRoutes); 
// app.use("/api/cities", cityRoutes); 
// app.use("/api/categories", categoryRoutes);
// app.use("/api/viewers", viewerRoutes);
// app.use('/api/messages', messageRoutes);


// // Default Route
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// // ✅ Error-handling middleware should be last
// app.use((err, req, res, next) => {
//   console.error("Error:", err.stack);
//   res.status(500).json({ status: "error", message: "Internal Server Error" });
// });

// // ✅ Start Server
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });


const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cookieParser = require("cookie-parser");

dotenv.config();
const connectdb = require("./src/config/db");
const chatSocket = require("./src/socket/ChatSocket");

// Import Routes
const userRoutes = require("./src/routes/UserRoutes");
const propertyRoutes = require("./src/routes/PropertyRoutes");
const enquiryRoutes = require("./src/routes/EnquiryRoutes");
const bookingRoutes = require("./src/routes/BookingRoutes");
const cityRoutes = require("./src/routes/CityRoutes");
const categoryRoutes = require("./src/routes/CategoryRoutes");
const viewerRoutes = require("./src/routes/ViewersRoutes");
const messageRoutes = require("./src/routes/MessageRoutes");

// ✅ Middleware
app.use(express.json()); // <-- FIXED
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS
const corsOptions = {
  origin: [
    "https://propertydeal0.netlify.app",
    "http://localhost:5173",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connect to MongoDB
connectdb();

// ✅ API Routes
app.use("/api/auth", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/viewers", viewerRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ✅ Error Handling
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ status: "error", message: "Internal Server Error" });
});

// ✅ Create HTTP server for socket.io
const server = http.createServer(app);

// ✅ Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for now, or secure to your frontend URL
  },
});
chatSocket(io); // Attach socket events

// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
