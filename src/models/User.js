import mongoose from "mongoose";

const { Schema } = mongoose;

const AddressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    line1: String,
    line2: String,
    city: String,
    state: String,
    zip: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "waiter", "kitchen", "manager", "admin"],
      default: "customer",
      index: true,
    },
    isActive: { type: Boolean, default: true },
    avatarUrl: String,
    addresses: [AddressSchema],

    // Loyalty (embedded summary; ledger lives in LoyaltyTransaction)
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyTier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "User" },

    // Notification prefs
    notifyByEmail: { type: Boolean, default: true },
    notifyBySms: { type: Boolean, default: false },

    lastLoginAt: Date,
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, isActive: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
