const express = require("express");
var app = express();
const mongoose = require("mongoose");

const cors = require("cors");

const { createServer } = require("http");
const { Server } = require("socket.io");

const path = require("path");

const DB =
  "mongodb+srv://sarmadshakeel20:5X2poTMSPn776GgG@ambulancedb.kn45m.mongodb.net/";
mongoose
  .connect(DB)
  .then(() => {
    console.log("connected to mongoDb");
  })
  .catch((ex) => {
    console.log(ex);
  });

const userRoutes = require("./src/routes/userRouters");
const rideRoutes = require("./src/routes/rideRoutes");
const socketService = require("./src/services/socketService");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket Connection Successfully Created", socket.id);
  socketService(socket, io);
});

app.set("io", io);
app.set("port", process.env.PORT || 4000);
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Ambulance Backend</h1>");
});

app.use("/api/user", userRoutes);
app.use("/api/ride", rideRoutes);

const port = app.get("port");
httpServer.listen(port, () =>
  console.log(`Listening to port number ${port}...`)
);

module.exports.app = app;
