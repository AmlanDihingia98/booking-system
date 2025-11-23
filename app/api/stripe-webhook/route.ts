import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = session.metadata?.appointmentId;

        if (!appointmentId) {
          console.error('No appointment ID in session metadata');
          break;
        }

        // Retrieve payment intent to get payment details
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string
        );

        // Update appointment payment status
        const { error } = await supabase
          .from('appointments')
          .update({
            payment_status: 'completed',
            stripe_payment_intent_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
            status: 'confirmed', // Automatically confirm appointment on payment
          })
          .eq('id', appointmentId);

        if (error) {
          console.error('Failed to update appointment:', error);
        }

        console.log(`Payment completed for appointment ${appointmentId}`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = session.metadata?.appointmentId;

        if (appointmentId) {
          // Mark payment as failed
          await supabase
            .from('appointments')
            .update({
              payment_status: 'failed',
            })
            .eq('id', appointmentId);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          // Get the appointment
          const { data: appointment } = await supabase
            .from('appointments')
            .select('*')
            .eq('stripe_payment_intent_id', paymentIntentId)
            .single();

          if (appointment) {
            const refundAmount = charge.amount_refunded / 100; // Convert from paise to rupees
            const totalAmount = appointment.payment_amount;

            const isPartialRefund = refundAmount < totalAmount;

            // Update appointment with refund info
            await supabase
              .from('appointments')
              .update({
                payment_status: isPartialRefund ? 'partially_refunded' : 'refunded',
                refund_amount: refundAmount,
                refunded_at: new Date().toISOString(),
              })
              .eq('id', appointment.id);

            console.log(`Refund processed for appointment ${appointment.id}: ₹${refundAmount}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
