const express = require("express");
const db = require("./db");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

console.log("User Routes Loaded");

const app = express();

app.use(express.json());

// Serve frontend files
app.use(express.static("public"));

// User Routes
app.use("/api/users", userRoutes);

// Product Routes
app.use("/api/products", productRoutes);

// Order Routes
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
    res.send("ShopEase Server is Running!");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});