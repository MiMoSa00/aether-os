import { NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: Request) {
  try {
    const { email, amount, invoiceId, clientName } = await request.json();

    if (!email || !amount || !invoiceId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, amount, invoiceId' },
        { status: 400 }
      );
    }

    const reference = `inv_${invoiceId}_${Date.now()}`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference,
        currency: 'NGN',
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoices?payment=success`,
        metadata: {
          invoiceId,
          clientName,
          custom_fields: [
            { display_name: 'Invoice ID', variable_name: 'invoice_id', value: invoiceId },
            { display_name: 'Client', variable_name: 'client', value: clientName || 'N/A' },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      access_code: data.data.access_code,
    });
  } catch (err: any) {
    console.error('Paystack invoice error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
