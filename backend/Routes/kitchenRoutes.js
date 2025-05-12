const express = require('express');
const kitchenRouter = express.Router();
const kitchenAuth = require('../middleware/kitchen');
const OrderItem = require("../models/Order");
const Table = require("../models/Table");
kitchenRouter.use(kitchenAuth);

kitchenRouter.get("/allOrders", async (req, res) => {
    try {
      const tables = await Table.find().lean();

      const orders = await OrderItem.find({ status: "created" })
        .populate('itemId', 'name options')
        .lean();
 
      const tableWiseOrders = {};
      
      tables.forEach(table => {
        tableWiseOrders[table.tableNo] = orders.filter(
          order => order.tableNo === table.tableNo
        ).map(order => ({
          _id: order._id,
          itemName: order.itemId.name,
          quantity: order.quantity,
          portion: order.portion,
          price: order.itemId.options[order.portion] * order.quantity,
          createdAt: order.createdAt,
          status: order.status
        }));
      });
  
      res.status(200).json({
        success: true,
        data: tableWiseOrders
      });
    } catch (err) {
      console.error("Error fetching kitchen orders:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch orders",
        details: err.message
      });
    }
  });
kitchenRouter.post("/cancelOrder/:tableId/:orderId",(req,res) => {
// deletes the selected order from the table
})
kitchenRouter.post("/sendBill",(req,res) => {
    // const {number} = req.body;
    //sends the bill by twilio to the number
})
kitchenRouter.post("/clearTable/:tableId", async (req, res) => {
  const { tableId } = req.params; 

  try {
    
      const orders = await OrderItem.updateMany(
          { tableNo: tableId, status: { $ne: "delivered" } }, 
          { status: "delivered" }  
      );

      // Check if any orders were updated
      if (orders.modifiedCount === 0) {
          return res.status(404).json({
              success: false,
              message: "No orders found for this table or all orders are already delivered"
          });
      }

      res.status(200).json({
          success: true,
          message: `All orders for table ${tableId} have been marked as delivered`
      });
  } catch (err) {
      console.error("Error clearing table:", err);
      res.status(500).json({
          success: false,
          error: "Failed to clear table",
          details: err.message
      });
  }
});
kitchenRouter.get('/tableOrders/:tableId', async (req, res) => {
  try {
    console.log("called!");
    const { tableId } = req.params;

    const orders = await OrderItem.find({
      tableNo: tableId,
      status: "created",
    }).sort({ createdAt: 1 }); 

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = kitchenRouter;