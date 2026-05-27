const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const productRoutes=require("./routes/productRoutes");
const orderRoutes=require("./routes/orderRoutes");
const notificationRoutes =require("./routes/notificationRoutes");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(
    path.join(__dirname, "uploads")
  )
);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);


// MongoDB connect
mongoose.connect("mongodb://Admin:1234@ac-xncu6lj-shard-00-00.6mqp90j.mongodb.net:27017,ac-xncu6lj-shard-00-01.6mqp90j.mongodb.net:27017,ac-xncu6lj-shard-00-02.6mqp90j.mongodb.net:27017/?ssl=true&replicaSet=atlas-ylsunl-shard-0&authSource=admin&appName=AgroLinkCluster")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Server is running");
});

const server = http.createServer(app);

const io = new Server(server, {

  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }

});

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

});

app.set("io", io);

// Broadcast to all clients
global.io = io;

server.listen(3000, () => {

  console.log(
    "Server running on port 3000"
  );

});