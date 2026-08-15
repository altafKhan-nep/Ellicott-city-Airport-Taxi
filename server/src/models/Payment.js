import mongoose from 'mongoose';

// Sandbox payment record. Real card providers (Stripe) can be swapped in later —
// the shape (amount, status, transactionId) is provider-agnostic.
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    method: { type: String, enum: ['card', 'wallet'], default: 'card' },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    // Set only on success; sparse so pending/failed payments don't collide.
    transactionId: { type: String, unique: true, sparse: true },
    // Caller-supplied idempotency key; unique index prevents double-charging.
    idempotencyKey: { type: String, unique: true, sparse: true },
    failureReason: { type: String, default: '' },
    cardLast4: { type: String, default: '' },
    refundedAt: Date,
    refundTransactionId: { type: String, default: '' },  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;