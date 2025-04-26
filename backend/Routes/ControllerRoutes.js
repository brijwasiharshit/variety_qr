const express = require("express")
const ControllerRouter = express.Router();
const validateNewUser = require("../validator/validateNewUser");
const bcrypt = require('bcrypt');
const User = require("../models/User");
const Table = require("../models/Table");
const controllerAuth = require("../middleware/controller");

ControllerRouter.use(controllerAuth);
ControllerRouter.post("/createUser", async (req, res) => {
    try {
      const { name, email, phoneNumber, password,role } = req.body;
      
      
      const { isValid, errors } = validateNewUser(name, email, phoneNumber, password);
  
      if (!isValid) {
        return res.status(400).json({ success: false, errors });
      }
  
      const passwordHash = await bcrypt.hash(password, 10); 
  
      const user = new User({
        name,
        email,
        phoneNumber,
        password: passwordHash,
        role
      });
  
      await user.save();
  
      res.status(201).json({ success: true, message: "User created successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });
  ControllerRouter.post("/addTable", async (req, res) => {
    try {
      const { table_no } = req.body;
  
      if (!table_no) {
        return res.status(400).json({ success: false, message: "Table number is required" });
      }
  
      const existingTable = await Table.findOne({ tableNo: table_no });
  
      if (existingTable) {
        return res.status(400).json({ success: false, message: "Table already exists" });
      }
  
      const table = new Table({ tableNo: table_no });
      await table.save();
      res.status(201).json({ success: true, message: "Table added successfully", table });
    } catch (err) {
      console.error("Error adding table:", err);
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: "Table already exists (duplicate key)" });
      }
  
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  


module.exports = ControllerRouter;