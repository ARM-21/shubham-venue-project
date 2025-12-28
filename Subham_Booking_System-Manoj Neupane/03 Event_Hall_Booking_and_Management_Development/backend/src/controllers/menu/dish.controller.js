import Dish from "../../models/menu/Dish.js";

export const getAllDishes = async (req, res) => {
    const dishes = await Dish.find().populate("section").lean();
    res.status(200).json(dishes);
}