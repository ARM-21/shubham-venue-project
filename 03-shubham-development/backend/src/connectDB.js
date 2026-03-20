import mongoose from "mongoose";
import  ENV  from "./config/env.config.js";
let isConnected = false;

export default async function getDBConnection() {
    if (isConnected) {
        console.log("✅ Already connected to MongoDB");
        return;
    }
    try {
        console.log("Connecting to Database.....");
        await mongoose.connect(ENV.MONGODB_URI);
        isConnected = true;
        console.log("....Database Connection Successfull...");

    } catch (error) {
        console.error("Database connection failed ❌ :", error.message);
        throw new Error("Database connection error");

    }
}
