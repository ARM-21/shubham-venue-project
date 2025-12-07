import mongoose from "mongoose";

const menuSectionSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  description: { type: String, default: "" },
  order: { type: Number, default: 0 }, 
}, { timestamps: true });

const MenuSection = mongoose.model("MenuSection", menuSectionSchema, "menu_sections");
export default MenuSection;