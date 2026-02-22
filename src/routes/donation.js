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

    const populated = await Donation.findById(newDonation._id).populate("createdBy", "name email");
    req.io.emit("newDonation", populated);

    res.status(201).json({ success: true, data: newDonation });
  } catch (err) {
    console.error("❌ Donation Add Error:", err);
    next(err);
  }
});

// ✅ Donor apni donations (sirf apni)
router.get("/my-donations", verifyToken, async (req, res, next) => {
  try {
    const donations = await Donation.find({ createdBy: req.user.id })
      .populate("acceptedBy", "name email") // ✅ YE ADD KARO
      .sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (err) {
    next(err);
  }
});

// ✅ NGO ke liye pending (sabki)
router.get("/pending", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ success: false, error: "Only NGOs can view pending donations" });
    }
    const donations = await Donation.find({ status: "pending" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (err) {
    next(err);
  }
});

// NGO ke sirf apne accepted
router.get("/accepted", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ success: false, error: "Only NGOs can view accepted donations" });
    }
    const donations = await Donation.find({
      status: "accepted",
      acceptedBy: req.user.id,
    })
      .populate("createdBy", "name email")
      .populate("acceptedBy", "name email") // ✅ YE ADD KARO
      .sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (err) {
    next(err);
  }
});

// NGO accepts donation
router.put("/accept/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ success: false, error: "Only NGOs can accept donations" });
    }
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: "accepted", acceptedBy: req.user.id },
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("acceptedBy", "name email"); // ✅ YE ADD KARO

    req.io.emit("donationAccepted", donation);
    res.json({ success: true, data: donation });
  } catch (err) {
    next(err);
  }
});

// ✅ NGO cancels donation
router.put("/cancel/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ success: false, error: "Only NGOs can cancel donations" });
    }
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: "pending", acceptedBy: null },
      { new: true }
    ).populate("createdBy", "name email");

    req.io.emit("donationCancelled", donation);
    res.json({ success: true, data: donation });
  } catch (err) {
    next(err);
  }
});

export default router;