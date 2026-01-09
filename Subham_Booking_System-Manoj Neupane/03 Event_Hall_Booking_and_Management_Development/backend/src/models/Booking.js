// models/booking.model.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  hallId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hall', 
    required: true,
    index: true
  },
  
  // Booking details
  date: { type: Date, required: true, index: true },
  slot: { 
    type: String, 
    enum: ['morning', 'evening', 'wholeday'], 
    required: true 
  },
  guests: { type: Number, required: true },
  
  // Event details
  eventType: { type: String },
  eventName: { type: String },
  specialRequirements: { type: String },
  
  // Menu
  selectedMenu: [{
    itemId: String,
    name: String,
    quantity: Number,
    pricePerUnit: Number,
    total: Number
  }],
  menuTotal: { type: Number, default: 0 },
  
  // Decorations
  decorationScheme: {
    schemeId: String,
    name: String,
    price: Number
  },
  addons: [{
    name: String,
    price: Number
  }],
  decorationTotal: { type: Number, default: 0 },
  
  // Pricing
  hallPrice: { type: Number },
  totalAmount: { type: Number, required: true },
  
  // Payment reference (instead of storing payment data here)
  paymentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Payment',
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
    index: true
  },
  
  // TTL for pending reservations
  reservedUntil: { type: Date },
  confirmedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  
}, { timestamps: true });

// Compound indexes
bookingSchema.index({ hallId: 1, date: 1, slot: 1 });
bookingSchema.index({ userId: 1, status: 1, createdAt: -1 });

// TTL Index
bookingSchema.index(
  { reservedUntil: 1 }, 
  { 
    expireAfterSeconds: 0,
    partialFilterExpression: { status: 'PENDING' }
  }
);

export default mongoose.model('Booking', bookingSchema);
