// import express from "express";
// import Donation from "../models/Donation.js";
// import upload from "../middlewares/upload.js"; // ✅ multer-cloudinary middleware


// const router = express.Router();

// // ✅ Donor adds a new donation with photo
// router.post("/", upload.single("photo"), async (req, res, next) => {
//   try {
//     console.log("📩 Request Body:", req.body);
//     console.log("📸 Uploaded File:", req.file);

//     const { foodName, quantity, location, expiry } = req.body;

//     if (!foodName || !quantity || !location || !expiry) {
//       return res.status(400).json({ success: false, error: "All fields are required" });
//     }

//     if (!req.file) {
//       return res.status(400).json({ success: false, error: "Photo is required" });
//     }

//     const newDonation = await Donation.create({
//       foodName,
//       quantity,
//       location,
//       expiry,
//       photo: req.file.path, // ✅ Cloudinary URL
//       status: "pending",
//     });

//     // 🔔 Notify NGOs in real-time
//     req.io.emit("newDonation", newDonation);

//     res.status(201).json({ success: true, data: newDonation });
//   } catch (err) {
//     console.error("❌ Donation Add Error:", err);
//     next(err); // ✅ pass to global error handler
//   }
// });

// // ✅ Get all pending donations (NGO side)
// router.get("/pending", async (req, res, next) => {
//   try {
//     const donations = await Donation.find({ status: "pending" });
//     res.json({ success: true, data: donations });
//   } catch (err) {
//     console.error("❌ Pending Donations Error:", err);
//     next(err);
//   }
// });

// // ✅ NGO accepts donation
// router.put("/accept/:id", async (req, res, next) => {
//   try {
//     const donation = await Donation.findByIdAndUpdate(
//       req.params.id,
//       { status: "accepted", acceptedBy: req.body.ngoId },
//       { new: true }
//     );

//     req.io.emit("donationAccepted", donation);

//     res.json({ success: true, data: donation });
//   } catch (err) {
//     console.error("❌ Accept Donation Error:", err);
//     next(err);
//   }
// });

// // ✅ NGO cancels donation (back to pending)
// router.put("/cancel/:id", async (req, res, next) => {
//   try {
//     const donation = await Donation.findByIdAndUpdate(
//       req.params.id,
//       { status: "pending", acceptedBy: null },
//       { new: true }
//     );

//     req.io.emit("donationCancelled", donation);

//     res.json({ success: true, data: donation });
//   } catch (err) {
//     console.error("❌ Cancel Donation Error:", err);
//     next(err);
//   }
// });

// export default router;



// import express from "express";
// import Donation from "../models/Donation.js";
// import upload from "../middlewares/upload.js"; // ✅ multer-cloudinary middleware
// import { verifyToken } from "./auth.js"; // 👈 auth.js se import

// const router = express.Router();

// // ✅ Donor adds a new donation with photo
// router.post("/", verifyToken, upload.single("photo"), async (req, res, next) => {
//   try {
//     console.log("📩 Request Body:", req.body);
//     console.log("📸 Uploaded File:", req.file);

//     const { foodName, quantity, location, expiry } = req.body;

//     if (!foodName || !quantity || !location || !expiry) {
//       return res.status(400).json({ success: false, error: "All fields are required" });
//     }

//     if (!req.file) {
//       return res.status(400).json({ success: false, error: "Photo is required" });
//     }

//     const newDonation = await Donation.create({
//       foodName,
//       quantity,
//       location,
//       expiry,
//       photo: req.file.path, // ✅ Cloudinary URL
//       status: "pending",
//       createdBy: req.user.id, // 👈 donor id store
//     });

//     // 🔔 Notify NGOs in real-time
//     req.io.emit("newDonation", newDonation);

//     res.status(201).json({ success: true, data: newDonation });
//   } catch (err) {
//     console.error("❌ Donation Add Error:", err);
//     next(err);
//   }
// });

// // ✅ Get all pending donations (NGO side)
// router.get("/pending", verifyToken, async (req, res, next) => {
//   try {
//     const donations = await Donation.find({ status: "pending" });
//     res.json({ success: true, data: donations });
//   } catch (err) {
//     console.error("❌ Pending Donations Error:", err);
//     next(err);
//   }
// });

// // ✅ NGO accepts donation
// router.put("/accept/:id", verifyToken, async (req, res, next) => {
//   try {
//     if (req.user.role !== "ngo") {
//       return res.status(403).json({ success: false, error: "Only NGOs can accept donations" });
//     }

//     const donation = await Donation.findByIdAndUpdate(
//       req.params.id,
//       { status: "accepted", acceptedBy: req.user.id }, // 👈 ngoId backend se aaya
//       { new: true }
//     );

//     req.io.emit("donationAccepted", donation);

//     res.json({ success: true, data: donation });
//   } catch (err) {
//     console.error("❌ Accept Donation Error:", err);
//     next(err);
//   }
// });

// // ✅ NGO cancels donation (back to pending)
// router.put("/cancel/:id", verifyToken, async (req, res, next) => {
//   try {
//     if (req.user.role !== "ngo") {
//       return res.status(403).json({ success: false, error: "Only NGOs can cancel donations" });
//     }

//     const donation = await Donation.findByIdAndUpdate(
//       req.params.id,
//       { status: "pending", acceptedBy: null },
//       { new: true }
//     );

//     req.io.emit("donationCancelled", donation);

//     res.json({ success: true, data: donation });
//   } catch (err) {
//     console.error("❌ Cancel Donation Error:", err);
//     next(err);
//   }
// });

// export default router;


// import express from "express";
// import Donation from "../models/Donation.js";
// import upload from "../middlewares/upload.js";
// import { verifyToken } from "./auth.js";

// const router = express.Router();

// // ✅ Donor adds a new donation with photo
// router.post("/", verifyToken, upload.single("photo"), async (req, res, next) => {
//   try {
//     console.log("📩 Request Body:", req.body);
//     console.log("📸 Uploaded File:", req.file);

//     const { foodName, quantity, location, expiry } = req.body;

//     if (!foodName || !quantity || !location || !expiry) {
//       return res.status(400).json({ success: false, error: "All fields are required" });
//     }

//     if (!req.file) {
//       return res.status(400).json({ success: false, error: "Photo is required" });
//     }

//     const newDonation = await Donation.create({
//       foodName,
//       quantity,
//       location,
//       expiry,
//       photo: req.file.path,
//       status: "pending",
//       createdBy: req.user.id,
//     });

//     req.io.emit("newDonation", newDonation);

//     res.status(201).json({ success: true, data: newDonation });
//   } catch (err) {
//     console.error("❌ Donation Add Error:", err);
//     next(err);
//   }
// });

// // ✅ Get all pending donations
// router.get("/pending", verifyToken, async (req, res, next) => {
//   try {
//     const donations = await Donation.find({ status: "pending" });
//     res.json({ success: true, data: donations });
//   } catch (err) {
//     console.error("❌ Pending Donations Error:", err);
//     next(err);
//   }
// });

// // ✅ NGO accepts donation
// router.put("/accept/:id", verifyToken, async (req, res, next) => {
//   try {
//     if (req.user.role !== "ngo") {
//       return res.status(403).json({ success: false, error: "Only NGOs can accept donations" });
//     }

//     const donation = await Donation.findByIdAndUpdate(
//       req.params.id,
//       { status: "accepted", acceptedBy: req.user.id },
//       { new: true }
//     );

//     req.io.emit("donationAccepted", donation);

//     res.json({ success: true, data: donation });
//   } catch (err) {
//     console.error("❌ Accept Donation Error:", err);
//     next(err);
//   }
// });

// // ✅ NGO cancels donation
// router.put("/cancel/:id", verifyToken, async (req, res, next) => {
//   try {
//     if (req.user.role !== "ngo") {
//       return res.status(403).json({ success: false, error: "Only NGOs can cancel donations" });
//     }

//     const donation = await Donation.findByIdAndUpdate(
//       req.params.id,
//       { status: "pending", acceptedBy: null },
//       { new: true }
//     );

//     req.io.emit("donationCancelled", donation);

//     res.json({ success: true, data: donation });
//   } catch (err) {
//     console.error("❌ Cancel Donation Error:", err);
//     next(err);
//   }
// });

// export default router;


// import express from "express";
// import Donation from "../models/Donation.js";
// import upload from "../middlewares/upload.js";
// import { verifyToken } from "./auth.js";

// const router = express.Router();

// // ✅ Donor adds a new donation with photo
// router.post("/", verifyToken, upload.single("photo"), async (req, res, next) => {
//   try {
//     const { foodName, quantity, location, expiry } = req.body;

//     if (!foodName || !quantity || !location || !expiry) {
//       return res.status(400).json({ success: false, error: "All fields are required" });
//     }
//     if (!req.file) {
//       return res.status(400).json({ success: false, error: "Photo is required" });
//     }

//     const newDonation = await Donation.create({
//       foodName,
//       quantity,
//       location,
//       expiry,
//       photo: req.file.path,
//       status: "pending",
//       createdBy: req.user.id,
//     });

//     req.io.emit("newDonation", newDonation);
//     res.status(201).json({ success: true, data: newDonation });
//   } catch (err) {
//     console.error("❌ Donation Add Error:", err);
//     next(err);
//   }
// });

// // ✅ Get all pending donations
// router.get("/pending", verifyToken, async (req, res, next) => {
//   try {
//     const donations = await Donation.find({ status: "pending" });
//     res.json({ success: true, data: donations });
//   } catch (err) {
//     console.error("❌ Pending Donations Error:", err);
//     next(err);
//   }
// });

// // ✅ Get all accepted donations (NEW)
// router.get("/accepted", verifyToken, async (req, res, next) => {
//   try {
//     const donations = await Donation.find({ status: "accepted" }).populate("acceptedBy", "name email");
//     res.json({ success: true, data: donations });
//   } catch (err) {
//     console.error("❌ Accepted Donations Error:", err);
//     next(err);
//   }
// });

// // ✅ NGO accepts donation
// router.put("/accept/:id", verifyToken, async (req, res, next) => {
//   try {
//     if (req.user.role !== "ngo") {
//       return res.status(403).json({ success: false, error: "Only NGOs can accept donations" });
//     }

//     const donation = await Donation.findByIdAndUpdate(
//       req.params.id,
//       { status: "accepted", acceptedBy: req.user.id },
//       { new: true }
//     );

//     req.io.emit("donationAccepted", donation);
//     res.json({ success: true, data: donation });
//   } catch (err) {
//     console.error("❌ Accept Donation Error:", err);
//     next(err);
//   }
// });

// // ✅ NGO cancels donation
// router.put("/cancel/:id", verifyToken, async (req, res, next) => {
//   try {
//     if (req.user.role !== "ngo") {
//       return res.status(403).json({ success: false, error: "Only NGOs can cancel donations" });
//     }

//     const donation = await Donation.findByIdAndUpdate(
//       req.params.id,
//       { status: "pending", acceptedBy: null },
//       { new: true }
//     );

//     req.io.emit("donationCancelled", donation);
//     res.json({ success: true, data: donation });
//   } catch (err) {
//     console.error("❌ Cancel Donation Error:", err);
//     next(err);
//   }
// });

// export default router;


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
