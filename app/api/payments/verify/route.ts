import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Reference required' }, { status: 400 });
  }

  try {
    // Verify with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful', data: data.data }, { status: 400 });
    }

    const { user_id, plan_id } = data.data.metadata;
    const amount_ngn = data.data.amount / 100; // convert kobo to naira

    // Save to Supabase using service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Ensure the plan exists in the plans table to satisfy the foreign key constraint on subscriptions
    const { data: planExists, error: planCheckError } = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('id', plan_id)
      .maybeSingle();

    if (planCheckError) {
      console.error('Error checking plan existence:', planCheckError);
    }

    if (!planExists) {
      // Dynamic fallback pricing & details based on plan_id
      let name = plan_id.charAt(0).toUpperCase() + plan_id.slice(1);
      let price = amount_ngn;
      let features: string[] = [`Standard access to ${name} plan features`];

      if (plan_id === 'test') {
        name = 'Test Plan';
        price = 200;
        features = ['Access to payment routing tests', 'Holds live payments', 'Ideal for developer system checks'];
      }

      const { error: planInsertError } = await supabaseAdmin.from('plans').insert([{
        id: plan_id,
        name,
        price_ngn: price,
        features
      }]);

      if (planInsertError) {
        console.error('Error inserting plan dynamically:', planInsertError);
      }
    }

    // Record payment (idempotent upsert on paystack_reference)
    await supabaseAdmin.from('payments').upsert([{
      user_id,
      amount_ngn,
      status: 'success',
      paystack_reference: reference,
      plan_id,
    }], { onConflict: 'paystack_reference' });

    // Upsert subscription (active for 30 days)
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    await supabaseAdmin.from('subscriptions').upsert([{
      user_id,
      plan_id,
      status: 'active',
      current_period_end: periodEnd.toISOString(),
      paystack_customer_code: data.data.customer?.customer_code || '',
    }], { onConflict: 'user_id' });

    return NextResponse.json({ success: true, plan_id, amount_ngn });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
