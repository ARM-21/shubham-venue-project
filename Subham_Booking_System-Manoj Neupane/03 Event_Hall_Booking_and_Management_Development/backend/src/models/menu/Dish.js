import mongoose from "mongoose";

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  slug: { type: String, required: true, unique: true, index: true },
  section: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "MenuSection",
    required: true,
    index: true
  },
  image: { type: String },
  isVegetarian: { type: Boolean, default: true },
  
}, { timestamps: true });


const Dish = mongoose.model("Dish", dishSchema, "menu_dishes");
export default Dish;