import mongoose from "mongoose";
import bcrypt from "bcrypt";

const otpSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    code: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"]
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600,  // in seconds
        index: true
    }
}, {
    timestamps: false 
});


otpSchema.pre("save", async function (next) {
    if (this.isModified('code')) {
        this.code = await bcrypt.hash(this.code.toString(), 10);
    }
    next();
});

otpSchema.methods.verifyCode = async function (plainCode) {
    return await bcrypt.compare(plainCode.toString(), this.code);
};

otpSchema.index({ userId: 1, isUsed: 1 });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
