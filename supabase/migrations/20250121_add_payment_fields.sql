-- Add payment-related columns to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'partially_refunded')),
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Create index for faster payment status queries
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_stripe_payment_intent ON appointments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_appointments_stripe_session ON appointments(stripe_session_id);

-- Add comment to payment_status column
COMMENT ON COLUMN appointments.payment_status IS 'Payment status: pending, completed, failed, refunded, partially_refunded';
COMMENT ON COLUMN appointments.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payments';
COMMENT ON COLUMN appointments.stripe_session_id IS 'Stripe Checkout Session ID';
