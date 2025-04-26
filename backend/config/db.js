require("dotenv").config();
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;


const connectDb = async () => {
    try {
 
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ Connected to MongoDB!");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1); 
    }
};

module.exports = connectDb;