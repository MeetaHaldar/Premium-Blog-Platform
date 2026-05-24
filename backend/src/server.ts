import app from './app';
import { connectDB } from './config/database';
import { configureCloudinary } from './config/cloudinary';
import authRoutes from './routes/auth';
import blogRoutes from './routes/blogs';
import paymentRoutes from './routes/payment';
import uploadRoutes from './routes/upload';
import userRoutes from './routes/user';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Backfill authorName/authorAvatar for existing blogs that don't have them yet
async function backfillAuthorNames() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    // Find blogs missing authorName
    const blogs = await db.collection('blogs').find({ authorName: { $in: [null, '', undefined] } }).toArray();
    if (blogs.length === 0) return;

    // Get all unique createdBy IDs
    const userIds = [...new Set(blogs.map((b: any) => b.createdBy?.toString()).filter(Boolean))];
    const users = await db.collection('users').find({ _id: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    let fixed = 0;
    for (const blog of blogs) {
      const user = userMap.get(blog.createdBy?.toString());
      if (user) {
        await db.collection('blogs').updateOne(
          { _id: blog._id },
          { $set: { authorName: user.name, authorAvatar: user.avatar || '' } }
        );
        fixed++;
      }
    }

    if (fixed > 0) console.log(`✅ Backfilled author names for ${fixed} blog(s)`);
  } catch (err) {
    console.error('Backfill warning (non-fatal):', err);
  }
}

// Init services
connectDB().then(() => backfillAuthorNames());
configureCloudinary();

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
