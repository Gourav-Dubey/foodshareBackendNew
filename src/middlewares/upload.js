import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "food_donations",
    allowed_formats: ["jpg", "avif", "jpeg", "png", "webp", "heic", "heif","png"],
  },
});

const upload = multer({ storage });

export default upload;
