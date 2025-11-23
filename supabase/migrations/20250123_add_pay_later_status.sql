-- Add 'pay_later' to payment_status check constraint
-- First, drop the existing constraint
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_payment_status_check;

-- Add the updated constraint with 'pay_later' included
ALTER TABLE appointments
ADD CONSTRAINT appointments_payment_status_check
CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'partially_refunded', 'pay_later'));

-- Update the comment
COMMENT ON COLUMN appointments.payment_status IS 'Payment status: pending, completed, failed, refunded, partially_refunded, pay_later';
