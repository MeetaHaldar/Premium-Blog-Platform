import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  blogId: mongoose.Types.ObjectId;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    paymentId: { type: String, default: '' },
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', paymentSchema);
