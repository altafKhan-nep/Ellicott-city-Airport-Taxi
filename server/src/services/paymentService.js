import crypto from 'crypto';
import { setTimeout as delay } from 'node:timers/promises';
import Payment from '../models/Payment.js';
import Ride from '../models/Ride.js';
import { getSettings } from './settingsService.js';

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const txId = (prefix) =>
  `${prefix}_${crypto.randomBytes(12).toString('hex')}`;

// Sandbox gateway: deterministic behavior driven by the card so flows are
// testable. Any card ending in "0002" declines (Stripe-style test card);
// "0000" is always approved; anything else succeeds ~95% of the time.
const chargeCard = async (amount, { cardLast4 }) => {
  await delay(1200); // simulated processing delay
  if (cardLast4 && cardLast4.endsWith('0002')) {
    return { ok: false, reason: 'Card was declined by the issuer.' };
  }
  if (cardLast4 && !cardLast4.endsWith('0000') && Math.random() < 0.05) {
    return { ok: false, reason: 'Insufficient funds.' };
  }
  return { ok: true, transactionId: txId('txn') };
};

// Charge for a ride. Idempotent: a succeeded payment for the ride is returned
// as-is, and a caller-provided idempotencyKey (unique) prevents double-charges.
export const processPayment = async (userId, rideId, { method = 'card', idempotencyKey, cardLast4 }) => {
  const settings = await getSettings();
  if (settings.paymentsEnabled === false) {
    throw fail('Online payments are disabled by the operator. Pay by cash or contact support.', 403);
  }

  const ride = await Ride.findOne({
    _id: rideId,
    passenger: userId,
    status: { $nin: ['cancelled'] },
  });
  if (!ride) throw fail('Ride not found or not yours to pay for', 404);

  // Duplicate-payment prevention #1: an existing successful payment.
  const existing = await Payment.findOne({ ride: rideId, status: 'succeeded' });
  if (existing) return existing;

  // Duplicate-payment prevention #2: caller-supplied idempotency key.
  let key = idempotencyKey || `ride:${rideId}`;
  const seen = await Payment.findOne({ idempotencyKey: key });
  if (seen) {
    throw fail('Payment request already processed. Check your payment status.', 409);
  }

  const amount = ride.status === 'completed' ? ride.fare.final : ride.fare.estimated;
  if (!amount || amount <= 0) throw fail('Cannot charge a ride with no fare', 400);

  const payment = await Payment.create({
    user: userId,
    ride: rideId,
    amount,
    method,
    idempotencyKey: key,
    cardLast4: cardLast4 || '',
    status: 'pending',
  });

  const result = await chargeCard(amount, { cardLast4 });

  if (!result.ok) {
    payment.status = 'failed';
    payment.failureReason = result.reason;
    await payment.save();
    return payment;
  }

  payment.status = 'succeeded';
  payment.transactionId = result.transactionId;
  await payment.save();

  // Sync the ride record (keeps /rides/:id self-contained).
  ride.payment = {
    method,
    status: 'paid',
    transactionId: result.transactionId,
  };
  await ride.save();

  return payment;
};

// Refund a succeeded payment. Only the payer (or an admin via admin routes).
export const refundPayment = async (userId, paymentId, admin = false) => {
  const query = { _id: paymentId, status: 'succeeded' };
  if (!admin) query.user = userId;

  const payment = await Payment.findOne(query);
  if (!payment) throw fail('No successful payment found to refund', 404);

  // Sandbox refund is instant and always succeeds.
  payment.status = 'refunded';
  payment.refundedAt = new Date();
  payment.refundTransactionId = txId('refund');
  await payment.save();

  const ride = await Ride.findById(payment.ride);
  if (ride) {
    ride.payment.status = 'refunded';
    await ride.save();
  }

  return payment;
};

export const getPayment = async (userId, paymentId, admin = false) => {
  const query = { _id: paymentId };
  if (!admin) query.user = userId;
  const payment = await Payment.findOne(query).populate('ride', 'pickup dropoff fare status');
  if (!payment) throw fail('Payment not found', 404);
  return payment;
};

export const listPayments = async (userId) =>
  Payment.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('ride', 'pickup dropoff fare status');