# Stripe Payment Integration Setup Guide

## ✅ What's Been Implemented

Your SPORVEDA booking system now has complete Stripe payment integration with:

- ✅ Upfront payment when booking appointments
- ✅ Support for Credit/Debit Cards, UPI, and Digital Wallets (Apple Pay, Google Pay)
- ✅ Partial refund policy for cancellations
- ✅ INR currency support
- ✅ Secure payment processing
- ✅ Automatic appointment confirmation on payment
- ✅ Payment status tracking

## 📋 Setup Instructions

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com/in) and create an account
2. Complete your business profile
3. Enable Indian payment methods (UPI, Cards, Wallets)

### Step 2: Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Keep these keys safe - you'll need them next

### Step 3: Add Environment Variables

Add these to your `.env.local` file (create it if it doesn't exist):

```env
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Replace `pk_test_...` and `sk_test_...` with your actual Stripe keys!

### Step 4: Run Database Migration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Open `/supabase/migrations/20250121_add_payment_fields.sql`
4. Copy all the content and paste it in the SQL Editor
5. Click **Run** to execute the migration

This adds payment tracking columns to your appointments table.

### Step 5: Set Up Stripe Webhook (For Production)

Webhooks allow Stripe to notify your app about payment events.

#### For Local Development:

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env.local`

#### For Production (Vercel):

1. Go to [Stripe Webhooks Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://your-domain.vercel.app/api/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
5. Copy the **Signing secret** and add it to Vercel environment variables

### Step 6: Update Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Publishable key)
   - `STRIPE_SECRET_KEY` (Secret key)
   - `STRIPE_WEBHOOK_SECRET` (Webhook secret)
   - `NEXT_PUBLIC_APP_URL` (Your production URL, e.g., `https://your-app.vercel.app`)
4. Redeploy your application

### Step 7: Test the Payment Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to the booking page and create an appointment
3. You'll be redirected to Stripe Checkout
4. Use Stripe test cards:
   - **Successful payment:** `4242 4242 4242 4242`
   - **Payment requires authentication:** `4000 0025 0000 3155`
   - **Payment declined:** `4000 0000 0000 9995`
   - **Expiry:** Any future date
   - **CVC:** Any 3 digits
   - **ZIP:** Any 5 digits

5. Complete the payment and verify:
   - You're redirected back to dashboard
   - Appointment status is `confirmed`
   - Payment status is `completed`

## 🔄 Payment Flow

1. **Patient books appointment:**
   - Fills booking form
   - Clicks "Proceed to Payment"
   - Appointment created with `payment_status: pending`

2. **Stripe Checkout:**
   - Redirected to Stripe hosted checkout page
   - Supports UPI, Cards, Apple Pay, Google Pay
   - Secure 3D authentication if required

3. **Payment Success:**
   - Stripe webhook notifies your app
   - Appointment status → `confirmed`
   - Payment status → `completed`
   - Patient redirected to dashboard

4. **Payment Failed:**
   - Payment status remains `pending`
   - Patient can try again or cancel

## 💰 Refund Policy

Your refund policy is configured in `/lib/stripe/config.ts`:

- **48+ hours before appointment:** 100% refund
- **24-48 hours before:** 50% refund (partial)
- **Less than 24 hours:** No refund

### To Process a Refund:

Call the refund API from your admin/staff dashboard:

```typescript
const response = await fetch('/api/refund-appointment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appointmentId: 'appointment-id',
    reason: 'Patient requested cancellation'
  }),
});

const result = await response.json();
```

## 📊 Payment Status Types

- `pending` - Payment not yet initiated
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Full refund issued
- `partially_refunded` - Partial refund issued

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use test keys in development** - Keys starting with `pk_test_` and `sk_test_`
3. **Switch to live keys in production** - Keys starting with `pk_live_` and `sk_live_`
4. **Verify webhook signatures** - Already implemented in webhook handler
5. **Never expose secret key** - Only use in server-side code

## 🧪 Testing Checklist

- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] Can create appointment and redirect to Stripe
- [ ] Payment successful with test card
- [ ] Appointment confirmed after payment
- [ ] Webhook receives payment events
- [ ] Refund processed correctly
- [ ] Partial refund works based on timing
- [ ] Payment status displayed in dashboard

## 📱 Supported Payment Methods in India

- ✅ **Credit/Debit Cards** (Visa, Mastercard, Amex, Rupay)
- ✅ **UPI** (Google Pay, PhonePe, Paytm, etc.)
- ✅ **Digital Wallets** (Apple Pay, Google Pay)
- ✅ **Net Banking** (All major Indian banks)

## 🐛 Troubleshooting

### Webhook not working:
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Verify webhook endpoint is publicly accessible
- Check Stripe Dashboard → Webhooks → Event logs

### Payment not confirming appointment:
- Check webhook is receiving `checkout.session.completed` event
- Verify Supabase RLS policies allow updates
- Check application logs for errors

### Refund failing:
- Ensure payment is `completed` before refunding
- Check `stripe_payment_intent_id` exists
- Verify refund policy timing is correct

## 📚 Additional Resources

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe India Guide](https://stripe.com/docs/india)

## 🎉 You're Ready!

Your payment system is now fully configured. Start testing with Stripe test cards and when ready, switch to live mode for production!

Need help? Check the Stripe Dashboard logs or review the error messages in your console.
