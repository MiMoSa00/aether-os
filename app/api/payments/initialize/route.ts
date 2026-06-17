import { NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

const PLANS: Record<string, { name: string; amount: number }> = {
  pro: { name: 'Pro', amount: 500000 },      // ₦5,000 in kobo
  agency: { name: 'Agency', amount: 1500000 }, // ₦15,000 in kobo
};

export async function POST(request: Request) {
  try {
    const { email, plan_id, user_id, callback_url } = await request.json();

    const plan = PLANS[plan_id];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const reference = `aether_${user_id}_${plan_id}_${Date.now()}`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: plan.amount,
        reference,
        currency: 'NGN',
        callback_url: callback_url || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/billing?payment=success`,
        metadata: {
          user_id,
          plan_id,
          plan_name: plan.name,
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: plan.name },
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
