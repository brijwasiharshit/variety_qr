const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'food_items'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  portion: {
    type: String,  
    required: true,
  },
  tableNo: {
    type: Number,
    required: true,
    ref: "Table",
  },
  status: {
    type: String,
    required: true,
    enum: ['created', 'in-progress', 'completed', 'cancelled'],
  },
}, { timestamps: true });

OrderItemSchema.index({ itemId: 1, tableNo: 1 }, { unique: false });

module.exports = mongoose.model("OrderItem", OrderItemSchema);
