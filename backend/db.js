require("dotenv").config();
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;
console.log(mongoURI);

const mongoDB = async() => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ Connected to MongoDB!");

        // Fetch data from "food_item" collection
        const foodItemCollection = mongoose.connection.db.collection("food_item");


        global.food_item = await foodItemCollection.find({}).toArray();

        // Fetch data from "foodCategory" collection
        const foodCategoryCollection = mongoose.connection.db.collection("food_Category");
        global.foodCategory = await foodCategoryCollection.find({}).toArray();

    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1); // Exit process if connection fails
    }
};

module.exports = mongoDB;