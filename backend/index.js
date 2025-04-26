const http = require('http');
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const cookieParser = require('cookie-parser');
const kitchenRouter = require('./Routes/kitchenRoutes');
const adminRouter = require('./Routes/adminRoutes');
const ControllerRouter = require('./Routes/ControllerRoutes');
const userRouter = require('./Routes/userRoutes');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());
connectDb().then(()=>{
    app.listen(port, () => {
        console.log(`✅ Server is running on port ${port}`);
    });
});

const corsOptions = {
    origin: 'http://localhost:3000', 
    credentials: true,
    optionsSuccessStatus: 200 
  };
  
  app.use(cors(corsOptions));
app.use(express.json());


app.use("/api/user", userRouter);
app.use("/api/kitchen",kitchenRouter);
app.use("/api/admin",adminRouter);
app.use("/api/controller",ControllerRouter);
app.get("/", (req, res) => {
    res.send("Hello World!");
});


