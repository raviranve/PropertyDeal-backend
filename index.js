// const express = require("express");
// const app = express();
// const dotenv = require("dotenv");
// const cors = require("cors");
// dotenv.config();
// const connectdb = require("./src/config/db");
// const cookieParser = require("cookie-parser");
// const path = require("path");

// // Import Routes
// const userRoutes = require("./src/routes/userRoutes");
// const propertyRoutes = require("./src/routes/PropertyRoutes");
// const enquiryRoutes = require("./src/routes/EnquiryRoutes"); // ✅ Import Enquiry Routes
// const bookingRoutes = require("./src/routes/BookingRoutes");

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); 
// app.use(cookieParser());

// const corsOptions = {
//   origin: true,
//   credentials: true, // Allow cookies
// };
// app.use(cors(corsOptions));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Connect to Database
// connectdb();

// // Routes with base path
// app.use("/api/auth", userRoutes);
// app.use("/api/properties", propertyRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("api/enquiries", enquiryRoutes);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// // Move this down: Error-handling middleware should be last
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ status: "error", message: "Internal Server Error" });
// });

// // Start Server
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });


const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const connectdb = require("./src/config/db");
const cookieParser = require("cookie-parser");
const path = require("path");

// Import Routes
const userRoutes = require("./src/routes/userRoutes");
const propertyRoutes = require("./src/routes/PropertyRoutes");
const enquiryRoutes = require("./src/routes/EnquiryRoutes");
const bookingRoutes = require("./src/routes/BookingRoutes");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*", // Update with frontend URL
    credentials: true,
  },
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

const corsOptions = {
  origin: true,
  credentials: true, // Allow cookies
};
app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to Database
connectdb();

// Store active users (userId -> socketId)
const activeUsers = new Map();

// ✅ Socket.io connection
io.on("connection", (socket) => {
  console.log("🟢 New Client Connected:", socket.id);

  // Handle new user joining
  socket.on("userConnected", (username) => {
    io.emit("userJoined", { message: `${username} has joined the website! `});
  });

  // 
  socket.on('message', (data) => {
    console.log('Message received:', data);
    io.emit('message', data); // Broadcast message to all users
  });

 
  // Handle user joining with userId
  socket.on("join", (userId) => {
    if (userId) {
      activeUsers.set(userId, socket.id);
      console.log(`User joined: ${userId} (Socket ID: ${socket.id})`);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove user from activeUsers map
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User left: ${userId}`);
        break;
      }
    }
  });

  // Handle errors in socket connection
  socket.on("error", (err) => {
    console.error("Socket Error:", err);
  });
});

// ✅ Make io available globally
app.set("socketio", io);


app.use("/api/auth", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/enquiries", enquiryRoutes); // Fixed!

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
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});