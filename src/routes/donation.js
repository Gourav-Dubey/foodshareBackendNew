import express from "express"; 
import Donation from "../models/Donation.js"; 
import upload from "../middlewares/upload.js"; 
import { verifyToken } from "./auth.js";

const router = express.Router();

// ✅ Donor adds a new donation
router.post("/", verifyToken, upload.single("photo"), async (req, res, next) => {
  try {
    const { foodName, quantity, location, expiry } = req.body;

    if (!foodName || !quantity || !location || !expiry || !req.file) {
      return res.status(400).json({ success: false, error: "All fields including photo are required" });
    }

    const newDonation = await Donation.create({
      foodName,
      quantity,
      location,
      expiry,
      photo: req.file.path,
      status: "pending",
      createdBy: req.user.id,
    });

    // ✅ Emit new donation
    req.io.emit("newDonation", newDonation);

    res.status(201).json({ success: true, data: newDonation });
  } catch (err) {
    console.error("❌ Donation Add Error:", err);
    next(err);
  }
});

// ✅ Get pending donations
router.get("/pending", verifyToken, async (req, res, next) => {
  try {
    const donations = await Donation.find({ status: "pending" });
    res.json({ success: true, data: donations });
  } catch (err) {
    next(err);
  }
});

// ✅ Get accepted donations
router.get("/accepted", verifyToken, async (req, res, next) => {
  try {
    const donations = await Donation.find({ status: "accepted" }).populate("acceptedBy", "name email");
    res.json({ success: true, data: donations });
  } catch (err) {
    next(err);
  }
});

// ✅ NGO accepts donation
router.put("/accept/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") return res.status(403).json({ success: false, error: "Only NGOs can accept donations" });

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: "accepted", acceptedBy: req.user.id },
      { new: true }
    );

    // ✅ Emit donation accepted
    req.io.emit("donationAccepted", donation);

    res.json({ success: true, data: donation });
  } catch (err) {
    next(err);
  }
});

// ✅ NGO cancels donation
router.put("/cancel/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") return res.status(403).json({ success: false, error: "Only NGOs can cancel donations" });

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: "pending", acceptedBy: null },
      { new: true }
    );

    // ✅ Emit donation cancelled
    req.io.emit("donationCancelled", donation);

    res.json({ success: true, data: donation });
  } catch (err) {
    next(err);
  }
});

export default router;
