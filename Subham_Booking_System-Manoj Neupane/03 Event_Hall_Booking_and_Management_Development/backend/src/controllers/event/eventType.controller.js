import { success } from "../../utils/http.utils.js";
import { listEventTypes } from "../../services/event/eventType.service.js";



export const getAllEvents = async  (req, res) => {
    const events = await listEventTypes();
    return success(res, { events }, "Events fetched successfully", 200);
}