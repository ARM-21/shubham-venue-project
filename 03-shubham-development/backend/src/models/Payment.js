import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NPR" },
    
    gateway: { type: String, enum: ["KHALTI", "ESEWA", "CASH"], required: true },
    
    status: {
      type: String,
      enum: ["INITIATED", "COMPLETED", "FAILED", "REFUNDED"],
      default: "INITIATED",
      index: true,
    },
    
    // gateway response data
    transactionId: { type: String, sparse: true, index: true },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },
    
    paidAt: { type: Date },
    
    invoiceUrl: { type: String }, // generated PDF link
  },
  { timestamps: true }
);

// Auto-cleanup INITIATED payments after 30 minutes (matches booking reservation timeout + buffer)
paymentSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 1800, // 30 minutes
    partialFilterExpression: { status: "INITIATED" }
  }
);

export default mongoose.model("Payment", paymentSchema);
