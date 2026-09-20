import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'wedonate',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'pdf'],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

router.post('/', upload.single('image'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    // req.file.path holds the remote URL when using CloudinaryStorage
    const imageUrl = req.file.path; 
    res.json({ success: true, data: { imageUrl, filename: req.file.filename } });
  } catch (error) {
    next(error);
  }
});

export default router;
