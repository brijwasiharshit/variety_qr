const { truncates } = require("bcryptjs");
const mongoose = require("mongoose")

const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    role:{
        type: String,
        default: 'Kitchen',
        enum: ['Kitchen', 'Admin', 'Controller']
    }
})

module.exports = mongoose.model("user", UserSchema)