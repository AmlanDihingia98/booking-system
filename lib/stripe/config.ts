import Stripe from 'stripe';

// Initialize Stripe with secret key (conditional for development)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null;

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'inr',
  paymentMethods: ['card'], // Stripe automatically enables digital wallets when available
  locale: 'en-IN',
};

// Refund policy configuration (in hours before appointment)
export const REFUND_POLICY = {
  fullRefund: 48, // Full refund if cancelled 48+ hours before
  partialRefund: 24, // 50% refund if cancelled 24-48 hours before
  noRefund: 0, // No refund if cancelled less than 24 hours before
  partialRefundPercentage: 0.5, // 50% refund
};
