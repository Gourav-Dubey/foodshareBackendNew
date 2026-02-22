import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  location: { type: String, required: true },
  expiry: { type: Date, required: true },
  photo: { type: String },
  status: { type: String, enum: ["pending", "accepted", "completed"], default: "pending" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  pickupStatus: { type: String, enum: ["idle", "otp_pending", "on_the_way", "completed"], default: "idle" },
  donorLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    address: { type: String, default: null }
  },
  ngoLiveLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  pickupOtp: { type: String, default: null },
}, { timestamps: true });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;