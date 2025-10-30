import mongoose from "mongoose";
import secrets from "./constants/index.js"
let isConnected = false;

export default async function getDBConnection() {
    if (isConnected) {
        console.log("✅ Already connected to MongoDB");
        return;
    }
    try {
        console.log("Connecting to Database.....");
        await mongoose.connect(secrets.DATABASE_URL);
        isConnected = true;
        console.log("....Database Connection Successfull...");
        
    } catch (error) {
        console.error("Database connection failed ❌ :", error.message);
        throw new Error("Database connection error");
    }
}
