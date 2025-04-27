const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const connectDb = require("./config/db");
const kitchenRouter = require('./Routes/kitchenRoutes');
const adminRouter = require('./Routes/adminRoutes');
const ControllerRouter = require('./Routes/ControllerRoutes');
const userRouter = require('./Routes/userRoutes');

const app = express();
const server = http.createServer(app);

// ⚡ Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // In production, replace * with your frontend URL
    methods: ["GET", "POST"],
  }
});

// 👥 Handle socket connection
io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id);
  });
});

// Make io accessible inside routes/controllers
app.set('io', io);

// 🌐 Middleware
const corsOptions = {
  origin: 'http://localhost:3000',  // your frontend URL
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 📦 Routes
app.use("/api/user", userRouter);
app.use("/api/kitchen", kitchenRouter);
app.use("/api/admin", adminRouter);
app.use("/api/controller", ControllerRouter);

// 🏠 Default Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 🚀 Connect DB and Start Server
const port = process.env.PORT || 5000;
connectDb()
  .then(() => {
    server.listen(port, () => {  // ⚠️ server.listen not app.listen
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to database:", error);
  });
