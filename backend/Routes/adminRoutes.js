const express = require('express');
const Order = require("../models/Order");
const FoodItem = require("../models/FoodItem");
const adminRouter = express.Router();
const adminAuth = require('../middleware/admin');
adminRouter.use(adminAuth);
// Get sales analytics

adminRouter.get("/analytics", async (req, res) => {
    try {
      // Get dates for the last 7 days
      const dates = [];
      const dailySales = [];
      const dailyOrders = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dates.push(formattedDate);
        
        // Start and end of day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Only include delivered orders
        const dailyData = await Order.aggregate([
          { 
            $match: { 
              createdAt: { $gte: startOfDay, $lte: endOfDay },
              status: 'delivered' // Only delivered orders
            } 
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: { $multiply: ["$quantity", "$price"] } },
              orderCount: { $sum: 1 }
            }
          }
        ]);
        
        dailySales.push(dailyData[0]?.totalSales || 0);
        dailyOrders.push(dailyData[0]?.orderCount || 0);
      }
      
      // Weekly totals (only delivered orders)
      const weeklyStart = new Date();
      weeklyStart.setDate(weeklyStart.getDate() - 6);
      weeklyStart.setHours(0, 0, 0, 0);
      
      const weeklyData = await Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: weeklyStart },
            status: 'delivered' // Only delivered orders
          } 
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: { $multiply: ["$quantity", "$price"] } },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: { $multiply: ["$quantity", "$price"] } }
          }
        }
      ]);
      
      // Today's data (only delivered orders)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayData = await Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: todayStart },
            status: 'delivered' // Only delivered orders
          } 
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: { $multiply: ["$quantity", "$price"] } }
          }
        }
      ]);
      
      // Top selling items (only delivered orders)
      const topItems = await Order.aggregate([
        { $match: { status: 'delivered' } }, // Only delivered orders
        {
          $lookup: {
            from: "food_items",
            localField: "itemId",
            foreignField: "_id",
            as: "foodItem"
          }
        },
        { $unwind: "$foodItem" },
        {
          $group: {
            _id: "$foodItem.name",
            totalQuantity: { $sum: "$quantity" },
            totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ]);
      
      res.json({
        success: true,
        dates,
        dailySales,
        dailyOrders,
        weeklySales: weeklyData[0]?.totalSales || 0,
        totalOrders: weeklyData[0]?.orderCount || 0,
        avgOrderValue: weeklyData[0]?.avgOrderValue || 0,
        todaySales: todayData[0]?.totalSales || 0,
        topItems: topItems || []
      });
      
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch analytics data",
        error: error.message
      });
    }
});

adminRouter.post("/toggleAvl", async (req, res) => {
    try {
        const { itemId } = req.body;
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "itemId is required"
            });
        }
        const foodItem = await FoodItem.findById(itemId);
        
        if (!foodItem) {
            return res.status(404).json({
                success: false,
                message: "Food item not found"
            });
        }
        foodItem.isAvailable = !foodItem.isAvailable;
 
        await foodItem.save();
        
        res.json({
            success: true,
            message: `Food item availability set to ${foodItem.isAvailable}`,
            isAvailable: foodItem.isAvailable
        });
    } catch (error) {
        console.error("Error toggling availability:", error);
        
        // Handle invalid ID format
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid itemId format"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Failed to toggle availability",
            error: error.message
        });
    }
});

adminRouter.post("/addfooditem", async(req, res) => {
    try {
        const { name, description, options, category, imageUrl } = req.body;

        // Validate required fields
        if (!name || !options || !category) {
            return res.status(400).json({
                success: false,
                message: "Name, options, and category are required fields"
            });
        }

        // Validate options is an object with at least one key-value pair
        if (typeof options !== 'object' || Object.keys(options).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Options must be an object with at least one price option"
            });
        }

        // Create new food item
        const newItem = new FoodItem({
            name,
            description: description || "",
            options,
            category,
            imageUrl: imageUrl || "",
            isAvailable: true
        });

        await newItem.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Food item added successfully!",
            foodItem: newItem
        });
    } catch (error) {
        console.error("Error adding food item:", error);
        
        // Handle duplicate name error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Food item with this name already exists"
            });
        }
        
        // Handle validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(e => ({
                field: e.path,
                message: e.message
            }));
            return res.status(400).json({ 
                success: false, 
                message: "Validation failed",
                errors 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: "Failed to add food item",
            error: error.message
        });
    }
});



module.exports = adminRouter;