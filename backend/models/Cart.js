const express = require('express');
const cartRouter = express.Router();
const cartModel = require('../models/cartItem');
cartRouter.post("/add", async(req, res) => {
    try {
        console.log("Received request:", req.body); 
        const cart = new cartModel(req.body);
        await cart.save();
        res.status(200).json({message: "Added successfully!"})

    } catch (error) {
        console.error("Error in /add API:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = cartRouter;