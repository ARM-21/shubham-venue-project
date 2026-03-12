import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["organizer_request"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    requestUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    requestUserName: {
      type: String,
      trim: true,
    },
    requestUserEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    note: {
      type: String,
      trim: true,
    },
    actionPath: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

adminNotificationSchema.index({ adminId: 1, isRead: 1, createdAt: -1 });

const AdminNotification = mongoose.model("AdminNotification", adminNotificationSchema);

export default AdminNotification;
