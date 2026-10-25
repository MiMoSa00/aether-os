import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { invoice_id, amount_ngn } = body;

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('client_invoices')
      .select('*')
      .eq('id', invoice_id)
      .eq('client_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Create Paystack payment initialization
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount_ngn * 100, // Convert to kobo
        email: user.email,
        reference: `INV-${invoice.invoice_number}-${Date.now()}`,
        metadata: {
          invoice_id,
          user_id: user.id,
          invoice_number: invoice.invoice_number
        }
      })
    });

    if (!paystackResponse.ok) {
      const error = await paystackResponse.json();
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const paystackData = await paystackResponse.json();

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Webhook endpoint to verify payment
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { reference, invoice_id } = body;

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`
        }
      }
    );

    if (!verifyResponse.ok) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const verifyData = await verifyResponse.json();

    if (verifyData.data.status === 'success') {
      // Update invoice status to paid
      const { error: updateError } = await supabase
        .from('client_invoices')
        .update({
          status: 'paid',
          paystack_reference: reference,
          paid_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Payment verified and invoice marked as paid' });
    }

    return NextResponse.json({ error: 'Payment unsuccessful' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
