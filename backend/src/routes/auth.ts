import express from 'express';
import * as authController from '../controllers/authController';
import { validateRegister, validateLogin, validateOTP, handleValidationErrors } from '../validators/auth';

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, authController.register);
router.post('/verify-otp', validateOTP, handleValidationErrors, authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
