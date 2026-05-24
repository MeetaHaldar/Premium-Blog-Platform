import express from 'express';
import { createCheckoutSession, stripeWebhook, verifySession, getPaymentHistory } from '../controllers/paymentController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Stripe webhook needs raw body — must be before express.json()
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.post('/create-checkout-session', auth, createCheckoutSession);
router.post('/verify-session', auth, verifySession);
router.get('/history', auth, getPaymentHistory);

export default router;
