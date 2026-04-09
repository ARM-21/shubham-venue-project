import Ticket from "../../models/Ticket.js";
import { Parser } from "json2csv";

/**
 * Export attendee list for an event as CSV
 */
export async function exportEventAttendees(eventId) {
  try {
    // Fetch all checked-in attendees for the event
    const attendees = await Ticket.find({ eventId, status: "ACTIVE" })
      .populate({
        path: "ownerUserId",
        select: "firstName lastName email phone",
      })
      .populate({
        path: "ticketTypeId",
        select: "name price",
      })
      .lean();

    if (attendees.length === 0) {
      return {
        csv: "No attendees found",
        filename: "attendees.csv",
      };
    }

    // Format data for CSV export
    const formattedData = attendees.map((ticket) => ({
      "Name": `${ticket.ownerUserId?.firstName || ""} ${ticket.ownerUserId?.lastName || ""}`.trim() || "N/A",
      "Email": ticket.ownerUserId?.email || "N/A",
      "Phone": ticket.ownerUserId?.phone || "N/A",
      "Ticket Type": ticket.ticketTypeId?.name || "N/A",
      "Price": ticket.ticketTypeId?.price || 0,
      "QR Code": ticket.qrCodeValue || "N/A",
      "Check-in Status": ticket.checkedInAt ? "Checked In" : "Pending",
      "Check-in Time": ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleString() : "-",
      "Registration Date": new Date(ticket.createdAt).toLocaleString(),
    }));

    // Convert to CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(formattedData);

    return {
      csv,
      filename: `attendees-export-${Date.now()}.csv`,
    };
  } catch (error) {
    console.error("Error exporting attendees:", error);
    throw error;
  }
}

/**
 * Export attendee list with all fields (including all statuses)
 */
export async function exportAllEventAttendees(eventId) {
  try {
    const attendees = await Ticket.find({ eventId })
      .populate({
        path: "ownerUserId",
        select: "firstName lastName email phone",
      })
      .populate({
        path: "ticketTypeId",
        select: "name price",
      })
      .lean();

    if (attendees.length === 0) {
      return {
        csv: "No attendees found",
        filename: "attendees-all.csv",
      };
    }

    const formattedData = attendees.map((ticket) => ({
      "Name": `${ticket.ownerUserId?.firstName || ""} ${ticket.ownerUserId?.lastName || ""}`.trim() || "N/A",
      "Email": ticket.ownerUserId?.email || "N/A",
      "Phone": ticket.ownerUserId?.phone || "N/A",
      "Ticket Type": ticket.ticketTypeId?.name || "N/A",
      "Price": ticket.ticketTypeId?.price || 0,
      "QR Code": ticket.qrCodeValue || "N/A",
      "Ticket Status": ticket.status,
      "Check-in Status": ticket.checkedInAt ? "Checked In" : "Pending",
      "Check-in Time": ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleString() : "-",
      "Registration Date": new Date(ticket.createdAt).toLocaleString(),
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(formattedData);

    return {
      csv,
      filename: `attendees-all-export-${Date.now()}.csv`,
    };
  } catch (error) {
    console.error("Error exporting all attendees:", error);
    throw error;
  }
}
