import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  location: { type: String, required: true },
  expiry: { type: Date, required: true },
//   donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  photo: { type: String }, // ✅ Cloudinary se URL save hoga
  status: { type: String, enum: ["pending", "accepted"], default: "pending" },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
