const mongoose = require('mongoose');
const tableSchema = mongoose.Schema({
    tableNo: {
        type: Number,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model("table", tableSchema);