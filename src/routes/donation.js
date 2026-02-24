import express from "express";
import Donation from "../models/Donation.js";
import upload from "../middlewares/upload.js";
import { verifyToken } from "./auth.js";

const router = express.Router();

// Geocoding helper
const geocodeAddress = async (address) => {
  // Multiple queries try karo — best match milega
  const queries = [
    `${address}, Madhya Pradesh, India`,
    `${address}, India`,
    address,
  ];

  for (const query of queries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=3&countrycodes=in&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "FoodShare/1.0 contact@foodshare.com",
            "Accept-Language": "en",
          }
        }
      );
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();
      console.log(`Geocoding "${query}":`, data.length > 0 ? `${data[0].lat}, ${data[0].lon} — ${data[0].display_name}` : "not found");

      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.warn(`Geocoding failed for "${query}":`, e.message);
    }
  }
  return { lat: null, lng: null };
};
// 4-digit OTP generate
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// ✅ Donor adds donation
router.post("/", verifyToken, upload.single("photo"), async (req, res, next) => {
  try {
    const { foodName, quantity, location, expiry } = req.body;
    
    // String se number mein convert karo properly
    let donorLat = req.body.donorLat ? parseFloat(req.body.donorLat) : null;
    let donorLng = req.body.donorLng ? parseFloat(req.body.donorLng) : null;

    // NaN check bhi karo
    if (isNaN(donorLat)) donorLat = null;
    if (isNaN(donorLng)) donorLng = null;

    console.log("Received donorLat:", req.body.donorLat, "→ parsed:", donorLat);
    console.log("Received donorLng:", req.body.donorLng, "→ parsed:", donorLng);

    if (!foodName || !quantity || !location || !expiry || !req.file) {
      return res.status(400).json({ success: false, error: "All fields including photo are required" });
    }

    // Frontend se nahi aaya toh backend geocode karo
    if (!donorLat || !donorLng) {
      console.log("Frontend geocoding failed, trying backend geocoding for:", location);
      const geo = await geocodeAddress(location);
      donorLat = geo.lat;
      donorLng = geo.lng;
      console.log("Backend geocoding result:", donorLat, donorLng);
    }

    const newDonation = await Donation.create({
      foodName, quantity, location, expiry,
      photo: req.file.path,
      status: "pending",
      createdBy: req.user.id,
      donorLocation: {
        lat: donorLat,
        lng: donorLng,
        address: location
      }
    });

    const populated = await Donation.findById(newDonation._id)
      .populate("createdBy", "name email");
    
    req.io.emit("newDonation", populated);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
});

// ✅ Donor apni donations
router.get("/my-donations", verifyToken, async (req, res, next) => {
  try {
    const donations = await Donation.find({ createdBy: req.user.id })
      .populate("acceptedBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (err) { next(err); }
});

// ✅ NGO pending donations
router.get("/pending", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") return res.status(403).json({ success: false, error: "Only NGOs" });
    const donations = await Donation.find({ status: "pending" })
      .populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (err) { next(err); }
});

// ✅ NGO accepted donations
// ✅ accepted + completed dono fetch karo
router.get("/accepted", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") return res.status(403).json({ success: false, error: "Only NGOs" });
    const donations = await Donation.find({ 
      status: { $in: ["accepted", "completed"] },  // ✅ dono
      acceptedBy: req.user.id 
    })
      .populate("createdBy", "name email")
      .populate("acceptedBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (err) { next(err); }
});

// ✅ NGO accepts donation — OTP generate hota hai
router.put("/accept/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") return res.status(403).json({ success: false, error: "Only NGOs" });

    const otp = generateOtp();

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: "accepted", acceptedBy: req.user.id, pickupOtp: otp, pickupStatus: "otp_pending" },
      { new: true }
    ).populate("createdBy", "name email").populate("acceptedBy", "name email");

    // Socket emit mein OTP HATAO — donor alag event se lega
    const donationForNgo = { ...donation.toObject(), pickupOtp: null };
    const donationForDonor = { ...donation.toObject() }; // OTP included

    // NGO ko OTP nahi dikhega
    req.io.emit("donationAccepted", donationForNgo);
    
    // Sirf donor ko OTP wala event bhejo (donor apne room mein hai)
    req.io.to(`donor_${donation.createdBy._id}`).emit("yourDonationAccepted", donationForDonor);

    res.json({ success: true, data: donationForNgo }); // NGO response mein bhi OTP nahi
  } catch (err) { next(err); }
});

// ✅ NGO cancels donation
router.put("/cancel/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") return res.status(403).json({ success: false, error: "Only NGOs" });
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: "pending", acceptedBy: null, pickupStatus: "idle", pickupOtp: null, ngoLiveLocation: { lat: null, lng: null } },
      { new: true }
    ).populate("createdBy", "name email");

    req.io.emit("donationCancelled", donation);
    res.json({ success: true, data: donation });
  } catch (err) { next(err); }
});

// ✅ NGO verifies OTP — tracking shuru hoti hai
router.put("/verify-otp/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") return res.status(403).json({ success: false, error: "Only NGOs" });

    const { otp, ngoLat, ngoLng } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ success: false, error: "Donation not found" });
    if (donation.pickupOtp !== String(otp).trim()) {
      return res.status(400).json({ success: false, error: "❌ Wrong OTP! Donor se dobara poocho." });
    }

    let donorLat = donation.donorLocation?.lat;
    let donorLng = donation.donorLocation?.lng;

    if (!donorLat || !donorLng) {
      const geo = await geocodeAddress(donation.location);
      donorLat = geo.lat; donorLng = geo.lng;
    }

    const updated = await Donation.findByIdAndUpdate(
      req.params.id,
      {
        pickupStatus: "on_the_way",
        pickupOtp: null, // OTP delete karo verify ke baad
        donorLocation: { lat: donorLat, lng: donorLng, address: donation.location },
        ngoLiveLocation: {
          lat: ngoLat ? parseFloat(ngoLat) : null,
          lng: ngoLng ? parseFloat(ngoLng) : null
        }
      },
      { new: true }
    ).populate("createdBy", "name email").populate("acceptedBy", "name email");

    // Dono ko emit karo
    req.io.emit("pickupStarted", updated);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// ✅ NGO live location update
router.put("/update-location/:id", verifyToken, async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    await Donation.findByIdAndUpdate(req.params.id, {
      ngoLiveLocation: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });
    req.io.emit(`ngoLocation_${req.params.id}`, { lat: parseFloat(lat), lng: parseFloat(lng) });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ✅ NGO completes pickup
router.put("/complete-pickup/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "ngo") return res.status(403).json({ success: false, error: "Only NGOs" });
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { pickupStatus: "completed", status: "completed" },
      { new: true }
    ).populate("createdBy", "name email").populate("acceptedBy", "name email");

    req.io.emit("pickupCompleted", donation);
    res.json({ success: true, data: donation });
  } catch (err) { next(err); }
});

export default router;