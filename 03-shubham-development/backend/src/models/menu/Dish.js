import mongoose from "mongoose";

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  slug: { type: String, required: true, unique: true, index: true },
  section: { 
    type: String,
    ref: "MenuSection",
    required: true,
    index: true
  },
  image: { type: String },
  isVegetarian: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  unitLabel: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  
}, { timestamps: true });

function slugifySafe(input) {
  if (!input) return '';
  return String(input)
    .trim()
    .toLowerCase();
}

// Ensure slug exists and is unique before validation/save
dishSchema.pre('validate', async function () {
  if (this.slug) return; 
  const name = this.name || '';
  let base = slugifySafe(name);
  let candidate = base;
  this.slug = candidate;
});


const Dish = mongoose.model("Dish", dishSchema, "menu_dishes");
export default Dish;