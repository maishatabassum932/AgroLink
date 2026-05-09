const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const productRoutes=require("./routes/productRoutes");
const orderRoutes=require("./routes/orderRoutes");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// MongoDB connect
mongoose.connect("mongodb://Admin:1234@ac-xncu6lj-shard-00-00.6mqp90j.mongodb.net:27017,ac-xncu6lj-shard-00-01.6mqp90j.mongodb.net:27017,ac-xncu6lj-shard-00-02.6mqp90j.mongodb.net:27017/?ssl=true&replicaSet=atlas-ylsunl-shard-0&authSource=admin&appName=AgroLinkCluster")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});