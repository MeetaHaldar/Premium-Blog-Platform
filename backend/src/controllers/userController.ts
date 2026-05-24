import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('-password -otp -otpExpiry');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;

    // Check email uniqueness if changing
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        res.status(400).json({ success: false, message: 'Email already in use' });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...(name && { name }), ...(email && { email }) },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry');

    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // Configure cloudinary at call time
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'premium-blog-platform/avatars',
      resource_type: 'image',
      width: 200,
      height: 200,
      crop: 'fill',
      gravity: 'face'
    });

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password -otp -otpExpiry');

    res.status(200).json({ success: true, message: 'Avatar updated', user });
  } catch (error: any) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
