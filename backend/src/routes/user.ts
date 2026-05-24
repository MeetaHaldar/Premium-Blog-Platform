import express from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { getProfile, updateProfile, updateAvatar, changePassword } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, os.tmpdir()),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB for avatars
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/avatar', auth, upload.single('avatar'), updateAvatar);
router.put('/change-password', auth, changePassword);

export default router;
