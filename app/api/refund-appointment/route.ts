import { NextRequest, NextResponse } from 'next/server';
import { stripe, REFUND_POLICY } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { appointmentId, reason } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if payment exists and is completed
    if (appointment.payment_status !== 'completed') {
      return NextResponse.json(
        { error: 'No completed payment found for this appointment' },
        { status: 400 }
      );
    }

    if (!appointment.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'No payment intent ID found' },
        { status: 400 }
      );
    }

    // Calculate hours until appointment
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Determine refund amount based on cancellation policy
    let refundPercentage = 0;
    let refundReason = reason || 'Appointment cancelled';

    if (hoursUntilAppointment >= REFUND_POLICY.fullRefund) {
      // Full refund if cancelled 48+ hours before
      refundPercentage = 1.0;
      refundReason += ' (Full refund - cancelled 48+ hours before appointment)';
    } else if (hoursUntilAppointment >= REFUND_POLICY.partialRefund) {
      // Partial refund if cancelled 24-48 hours before
      refundPercentage = REFUND_POLICY.partialRefundPercentage;
      refundReason += ` (${REFUND_POLICY.partialRefundPercentage * 100}% refund - cancelled 24-48 hours before appointment)`;
    } else {
      // No refund if cancelled less than 24 hours before
      return NextResponse.json(
        {
          error: 'No refund available - appointment is less than 24 hours away',
          hoursUntilAppointment: Math.round(hoursUntilAppointment * 10) / 10,
        },
        { status: 400 }
      );
    }

    // Calculate refund amount in paise
    const refundAmount = Math.round(appointment.payment_amount * refundPercentage * 100);

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: appointment.stripe_payment_intent_id,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        appointmentId: appointmentId,
        refundPercentage: `${refundPercentage * 100}%`,
        refundReason: refundReason,
      },
    });

    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        payment_status: refundPercentage === 1.0 ? 'refunded' : 'partially_refunded',
        refund_amount: refundAmount / 100, // Convert back to rupees
        refund_reason: refundReason,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Failed to update appointment:', updateError);
      return NextResponse.json(
        { error: 'Refund created but failed to update appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      refundAmount: refundAmount / 100,
      refundPercentage: refundPercentage * 100,
      message: `Refund of ₹${refundAmount / 100} (${refundPercentage * 100}%) processed successfully`,
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process refund' },
      { status: 500 }
    );
  }
}
