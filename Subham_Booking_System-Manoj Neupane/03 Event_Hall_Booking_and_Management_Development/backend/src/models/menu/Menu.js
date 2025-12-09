import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },

  pricePerPerson: { type: Number, required: true },
  slug: {
    type: String, required: true, unique: true, index: true, default: function () {
      return this.name.toLowerCase().split(' ').join('-');
    },
  },
  
  description: { type: String, default: "" },
    sections: [
      {
        section: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuSection",
          required: true
        },

        selectLimit: { type: Number, default: 0 },

        dishes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dish",
          }
        ]
      }
    ],
    dishCount: { type: Number, default: 0 },
    isCustomMenu: { type: Boolean, default: false },
    createdByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    isActive: { type: Boolean, default: true }

  }, { timestamps: true });

// menuSchema.index({ isCustomMenu: 1, isActive: 1 });
const Menu = mongoose.model("Menu", menuSchema);

export default Menu;