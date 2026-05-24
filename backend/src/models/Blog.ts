import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IBlog extends Document {
  title: string;
  slug: string;
  description: string;
  content: string;
  featuredImage: string;
  language: string;
  status: 'draft' | 'published';
  likesCount: number;
  likedBy: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  authorName: string;       // denormalized — always correct even if user is deleted
  authorAvatar: string;     // denormalized
  isPremium: boolean;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: [true, 'Please provide a blog title'], trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: [true, 'Please provide a description'], maxlength: 500 },
    content: { type: String, required: [true, 'Please provide blog content'] },
    featuredImage: { type: String, required: true },
    language: { type: String, default: 'en', enum: ['en', 'hi', 'es', 'fr'] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    likesCount: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, default: '' },
    authorAvatar: { type: String, default: '' },
    isPremium: { type: Boolean, default: false },
    price: { type: Number, default: 0 }
  },
  { timestamps: true }
);

blogSchema.pre<IBlog>('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model<IBlog>('Blog', blogSchema);
