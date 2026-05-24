import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Email Verification OTP',
      html: `<h2>Email Verification</h2><p>Your OTP is: <strong>${otp}</strong></p><p>This OTP will expire in 10 minutes.</p>`
    });
  } catch (emailError) {
    // In development, log OTP to console if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📧 [DEV MODE] OTP for ${email}: ${otp}\n`);
    } else {
      throw emailError;
    }
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user = new User({ name, email, password, otp, otpExpiry, isVerified: false });
    await user.save();
    await sendOTPEmail(email, otp);
    res.status(201).json({
      success: true,
      message: 'OTP sent to email. Please verify to complete registration.',
      email,
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) {
      res.status(400).json({ success: false, message: 'User not found' });
      return;
    }
    if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      return;
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.status(200).json({ success: true, message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: 'User not found' });
      return;
    }
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTPEmail(email, otp);
    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    if (!user.isVerified) {
      res.status(403).json({ success: false, message: 'Please verify your email first' });
      return;
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' } as any
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: 'User not found' });
      return;
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.otp = resetTokenHash;
    user.otpExpiry = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: 'Password Reset Link',
        html: `<h2>Password Reset</h2><p>Click the link below to reset your password:</p><a href="${resetURL}">Reset Password</a><p>This link will expire in 30 minutes.</p>`
      });
    } catch (emailError) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔑 [DEV MODE] Password reset URL for ${email}:\n${resetURL}\n`);
      } else {
        throw emailError;
      }
    }
    res.status(200).json({ success: true, message: 'Password reset link sent to email' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, token, newPassword } = req.body;
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ email, otp: resetTokenHash, otpExpiry: { $gt: new Date() } }).select('+otp +otpExpiry');
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired token' });
      return;
    }
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
