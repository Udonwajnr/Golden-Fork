import mongoose from "mongoose";

const { Schema } = mongoose;

const SupplierSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contactName: String,
    email: String,
    phone: String,
    address: String,
    notes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Supplier ||
  mongoose.model("Supplier", SupplierSchema);
