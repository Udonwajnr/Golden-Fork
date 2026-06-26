import mongoose from "mongoose";

const { Schema } = mongoose;

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" }, // set if submitted while logged in
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
      index: true,
    },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

ContactMessageSchema.index({ createdAt: -1 });

export default mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", ContactMessageSchema);