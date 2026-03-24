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
    }
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