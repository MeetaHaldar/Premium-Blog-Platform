import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      res.status(500).json({ success: false, message: 'Cloudinary env vars missing in backend/.env' });
      return;
    }

    // Re-configure at call time to guarantee env vars are loaded
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'premium-blog-platform',
      resource_type: 'image'
    });

    // Clean up temp file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error: any) {
    // Clean up temp file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Cloudinary upload error:', JSON.stringify(error));

    // Surface specific Cloudinary errors
    const msg = error?.message || error?.error?.message || 'Upload failed';
    const code = error?.http_code || error?.error?.http_code || 500;

    res.status(code === 401 ? 401 : 500).json({
      success: false,
      message: `Upload failed: ${msg}`
    });
  }
};
