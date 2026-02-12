import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post("/single", requireAuth, requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ message: "Cloudinary is not configured" });
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  const uploadResult = await new Promise<{ secure_url: string; original_filename: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "excellent_tutor",
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error);
          }
          resolve({
            secure_url: result.secure_url,
            original_filename: result.original_filename ?? req.file!.originalname,
          });
        }
      );
      stream.end(req.file.buffer);
    }
  );

  res.json({ url: uploadResult.secure_url, filename: uploadResult.original_filename });
});

export default router;
