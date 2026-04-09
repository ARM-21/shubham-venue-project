import mongoose from "mongoose";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      default: function() {
        return this.email.split('@')[0];
      }
    }
    ,
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Please enter a valid email address"],
      lowercase: true,
      trim: true
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    profilePicture: {
      type: String
    },
    password: {
      type: String,
      required: function() {
        return this.provider === 'local';
      }
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    googleId: {
      type: String
    },
    isVerified:{
      type: Boolean,
      required: function() {
        return this.provider === 'local';
      },
      default: function() {
        return this.provider === 'google' ? true : false;
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    notifyBookings: {
      type: Boolean,
      default: true
    },
    organizerStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none'
    },
    organizerNote: {
      type: String,
      trim: true
    },
    organizerRequestedAt: {
      type: Date
    },
    isOrganizerEligible: {
      type: Boolean,
      default: false
    },
    hasCompletedOnboarding: {
      type: Boolean,
      default: false
    },
    city: {
      type: String,
      trim: true
    },
    preferredEventTypes: [{
      type: String,
      trim: true
    }],
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    // Organizer Details (only if isOrganizerEligible is true)
    organizerDetails: {
      taxId: {
        type: String,
        trim: true
      },
      bankCode: {
        type: String,
        trim: true
      },
      bankAccount: {
        type: String,
        trim: true
      },
      accountHolder: {
        type: String,
        trim: true
      },
      notificationsEmail: {
        type: Boolean,
        default: true
      },
      notificationsSms: {
        type: Boolean,
        default: false
      },
      notificationsEventUpdates: {
        type: Boolean,
        default: true
      }
    },

    // Trust & Reputation System
    trustMetrics: {
      eventsCreated: {
        type: Number,
        default: 0,
      },
      eventsApproved: {
        type: Number,
        default: 0,
      },
      currentFlags: {
        type: Number,
        default: 0,
      },
      resolvedFlags: {
        type: Number,
        default: 0,
      },
      suspensionCount: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5,
      },
      trustScore: {
        type: Number,
        default: 3, // 1-5 scale, starts at 3 (neutral)
        min: 1,
        max: 5,
      },
      requiresApproval: {
        type: Boolean,
        default: false,
      },
      lastUpdatedAt: Date,
    },

    // Suspension & Enforcement
    suspensionStatus: {
      type: String,
      enum: ["none", "temporary", "permanent"],
      default: "none",
    },
    suspendedAt: Date,
    suspensionReason: String,
    suspensionEndDate: Date,
    suspensionHistory: [
      {
        suspendedAt: Date,
        suspendedUntil: Date,
        reason: String,
        liftedAt: Date,
        liftedBy: mongoose.Schema.Types.ObjectId,
      },
    ],

    // User uploads tracking (banners, menu images, etc.)
    uploads: [
      {
        url: {
          type: String,
          required: true,
        },
        s3Key: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['banner', 'menu', 'decoration', 'avatar'],
          default: 'banner',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        label: String, // Optional label/name for the upload
      },
    ],
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  
  // Only initialize organizerDetails if user is organizer eligible
  if (!this.isOrganizerEligible) {
    this.organizerDetails = undefined;
  }
  
  next()
})

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password)
}
const User = mongoose.model("User", userSchema);

export default User;