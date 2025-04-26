const express = require("express");
const validateLogin = require("../validator/validateLogin");
const User = require("../models/User");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
require('dotenv').config();

router.get("/foodData", async (req, res) => {
  try {
    console.log("Fetching food data...");

    // Ensure global variables exist
    if (!global.food_item || !global.foodCategory) {
      console.error("❌ Food data not available in global variables.");
      return res.status(500).json({ error: "Food data not loaded yet!" });
    }

    console.log("✅ Food data fetched successfully!");
    res.json({
      foodItems: global.food_item,
      foodCategories: global.foodCategory,
    });
  } catch (error) {
    console.error("❌ Error fetching food data:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  validateLogin(email, password);
  const user = await User.findOne({ email: email });
  if (!user) res.status(404).json({ message: "User doesn't exists!" });
  console.log(user);
  const isPassCorrect = await bcrypt.compare(password, user.password);
  if (!isPassCorrect) res.status(401).json({ message: "Invalid Credentials!" });
  const tokenSecret = process.env.TOKEN_SECRET;
  console.log("userrole", user.role);
  const token = await jwt.sign( { id: user._id, role: user.role },tokenSecret,{expiresIn: '1d'});
  res.cookie("token",token);
  res.status(200).json({message: "Logged in Successfully!"});
});

router.post("/placeOrder", async (req, res) => {
  const {itemName,quantity,price,tableNo} = req.body;
  
});
router.get("/:tableNumber/currentOrders", (req, res) => {});

module.exports = router;
