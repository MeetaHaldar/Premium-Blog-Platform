import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment';
import User from '../models/User';
import Blog from '../models/Blog';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('sk_test_your')) {
    throw new Error('Stripe is not configured. Add your STRIPE_SECRET_KEY to backend/.env');
  }
  return new Stripe(key, { apiVersion: '2024-06-20' as any });
};

// POST /api/payments/create-checkout-session
export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { blogId } = req.body;
    const userId = (req as any).user.id;

    const blog = await Blog.findById(blogId);
    const user = await User.findById(userId);

    if (!blog || !user) {
      res.status(404).json({ success: false, message: 'Blog or user not found' });
      return;
    }
    if (!blog.isPremium) {
      res.status(400).json({ success: false, message: 'Blog is not premium' });
      return;
    }
    if (user.purchasedBlogs.some(id => id.toString() === blogId)) {
      res.status(400).json({ success: false, message: 'Already purchased' });
      return;
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: blog.title,
              description: blog.description,
              images: blog.featuredImage ? [blog.featuredImage] : []
            },
            unit_amount: (blog.price || 0) * 100 // paise
          },
          quantity: 1
        }
      ],
      metadata: {
        blogId: blogId.toString(),
        userId: userId.toString()
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&slug=${blog.slug}`,
      cancel_url: `${process.env.FRONTEND_URL}/blog/${blog.slug}?payment=cancelled`
    });

    // Save pending payment record
    await Payment.create({
      userId,
      blogId,
      orderId: session.id,
      paymentId: '',
      amount: blog.price,
      currency: 'INR',
      status: 'pending'
    });

    res.status(200).json({ success: true, sessionId: session.id, url: session.url });
  } catch (error: any) {
    // Surface Stripe config errors clearly instead of generic 500
    if (error.message?.includes('Stripe is not configured')) {
      res.status(503).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

// POST /api/payments/webhook — raw body required for Stripe signature verification
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    res.status(500).json({ message: 'Webhook secret not configured' });
    return;
  }

  let event: any;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ message: `Webhook Error: ${err.message}` });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { blogId, userId } = session.metadata || {};

    if (blogId && userId) {
      try {
        // Mark payment success
        await Payment.findOneAndUpdate(
          { orderId: session.id },
          { status: 'success', paymentId: session.payment_intent as string }
        );

        // Grant access to user
        const user = await User.findById(userId);
        if (user && !user.purchasedBlogs.some(id => id.toString() === blogId)) {
          user.purchasedBlogs.push(blogId as any);
          await user.save();
        }
        console.log(`✅ Payment success: user ${userId} purchased blog ${blogId}`);
      } catch (err) {
        console.error('Error processing webhook:', err);
      }
    }
  }

  res.json({ received: true });
};

// POST /api/payments/verify-session  (called from success page)
export const verifySession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId } = req.body;
    const userId = (req as any).user.id;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      res.status(400).json({ success: false, message: 'Payment not completed' });
      return;
    }

    const { blogId } = session.metadata || {};
    if (!blogId) {
      res.status(400).json({ success: false, message: 'Invalid session metadata' });
      return;
    }

    // Idempotent — grant access if not already granted
    const user = await User.findById(userId);
    if (user && !user.purchasedBlogs.some(id => id.toString() === blogId)) {
      user.purchasedBlogs.push(blogId as any);
      await user.save();
    }

    await Payment.findOneAndUpdate(
      { orderId: sessionId },
      { status: 'success', paymentId: session.payment_intent as string }
    );

    const blog = await Blog.findById(blogId).select('slug title');
    res.status(200).json({ success: true, message: 'Payment verified', blog });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/history
export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const payments = await Payment.find({ userId, status: 'success' })
      .populate('blogId', 'title slug featuredImage')
      .skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Payment.countDocuments({ userId, status: 'success' });
    res.status(200).json({ success: true, payments, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};
