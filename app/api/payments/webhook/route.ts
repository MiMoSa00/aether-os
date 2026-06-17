import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  // Verify webhook signature
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  switch (event.event) {
    case 'charge.success': {
      const { metadata, amount, customer, reference } = event.data;
      if (!metadata?.user_id) break;

      const amount_ngn = amount / 100;

      // Record payment
      await supabaseAdmin.from('payments').upsert([{
        user_id: metadata.user_id,
        amount_ngn,
        status: 'success',
        paystack_reference: reference,
        plan_id: metadata.plan_id || 'pro',
      }], { onConflict: 'paystack_reference' });

      // Update subscription
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);
      await supabaseAdmin.from('subscriptions').upsert([{
        user_id: metadata.user_id,
        plan_id: metadata.plan_id || 'pro',
        status: 'active',
        current_period_end: periodEnd.toISOString(),
        paystack_customer_code: customer?.customer_code || '',
      }], { onConflict: 'user_id' });
      break;
    }

    case 'subscription.disable': {
      const { customer } = event.data;
      // Find user by customer code and disable their subscription
      const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('paystack_customer_code', customer?.customer_code)
        .single();

      if (sub) {
        await supabaseAdmin.from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('user_id', sub.user_id);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
