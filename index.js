const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const connectdb = require("./src/config/db");

connectdb();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});