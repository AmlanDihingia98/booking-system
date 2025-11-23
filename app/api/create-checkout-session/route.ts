import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system not configured. Please add Stripe API keys to environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { appointmentId, serviceId, returnUrl } = body;

    if (!appointmentId || !serviceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, patient:profiles!appointments_patient_id_fkey(email, full_name)')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Convert price to paise (Stripe uses smallest currency unit)
    const amountInPaise = Math.round(service.price * 100);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: service.name,
              description: `Appointment on ${appointment.appointment_date} at ${appointment.start_time}`,
            },
            unit_amount: amountInPaise,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}${returnUrl || '/dashboard'}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book?canceled=true`,
      customer_email: appointment.patient.email,
      metadata: {
        appointmentId: appointmentId,
        serviceId: serviceId,
        patientName: appointment.patient.full_name,
      },
      // Enable digital wallets
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    });

    // Update appointment with session ID
    await supabase
      .from('appointments')
      .update({
        stripe_session_id: session.id,
        payment_amount: service.price,
        payment_currency: STRIPE_CONFIG.currency.toUpperCase(),
      })
      .eq('id', appointmentId);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
