import mongoose from "mongoose";

const { Schema } = mongoose;

const ReservationSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    guestInfo: {
      name: { type: String, required: true },
      email: String,
      phone: { type: String, required: true },
    },
    partySize: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true }, // date + time combined
    durationMinutes: { type: Number, default: 90 },
    table: { type: Schema.Types.ObjectId, ref: "Table" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "seated", "completed", "cancelled", "no-show"],
      default: "pending",
      index: true,
    },
    specialRequests: String,
    occasion: {
      type: String,
      enum: ["none", "birthday", "anniversary", "business", "date", "other"],
      default: "none",
    },
  },
  { timestamps: true }
);

ReservationSchema.index({ date: 1, status: 1 });

export default mongoose.models.Reservation ||
  mongoose.model("Reservation", ReservationSchema);
