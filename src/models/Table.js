import mongoose from "mongoose";

const { Schema } = mongoose;

const TableSchema = new Schema(
  {
    label: { type: String, required: true }, // e.g. "T1", "Patio 3"
    capacity: { type: Number, required: true, min: 1 },
    location: {
      type: String,
      enum: ["main", "patio", "bar", "private"],
      default: "main",
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "cleaning"],
      default: "available",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Table || mongoose.model("Table", TableSchema);
