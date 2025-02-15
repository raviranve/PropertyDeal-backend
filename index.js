const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require('cors');
dotenv.config();
const connectdb = require("./src/config/db");
const cookieParser = require("cookie-parser");
const userRoutes = require("./src/routes/UserRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use(cookieParser());
// app.use(cors({ credentials: true, origin: true })); // Allow frontend to send cookies
const corsOptions = {
    origin: true, 
    credentials: true, // Allow cookies
    // methods: ["GET", "POST", "PATCH", "DELETE"], // Restrict allowed methods
  };
  
app.use(cors(corsOptions));
  
connectdb();

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
});
  

app.use(userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});