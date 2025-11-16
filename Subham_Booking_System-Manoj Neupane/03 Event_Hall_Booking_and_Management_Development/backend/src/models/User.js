import mongoose from "mongoose";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    first_name: {
      type: String,
      trim: true
    },
    last_name: {
      type: String,
      trim: true
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
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    googleId: {
      type: String
    },
    isOrganizerEligible: {
      type: Boolean,
      default: false
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
  next()
})

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password)
}
const User = mongoose.model("User", userSchema);

export default User;