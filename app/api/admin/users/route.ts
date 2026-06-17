import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Guard: only allow requests that include the admin email verification
  const authHeader = request.headers.get('x-admin-token');
  if (authHeader !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role client — bypasses RLS, can read auth.users
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Fetch all users from auth.users
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  // Fetch all payments
  const { data: payments } = await supabaseAdmin
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch all subscriptions
  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('*');

  // Fetch all messages (activity count per user)
  const { data: messages } = await supabaseAdmin
    .from('messages')
    .select('user_id');

  // Build enriched user list
  const msgCountMap: Record<string, number> = {};
  (messages || []).forEach((m: any) => {
    msgCountMap[m.user_id] = (msgCountMap[m.user_id] || 0) + 1;
  });

  const enrichedUsers = (users || []).map((u: any) => {
    const sub = (subscriptions || []).find((s: any) => s.user_id === u.id);
    const userPayments = (payments || []).filter((p: any) => p.user_id === u.id);
    const totalPaid = userPayments
      .filter((p: any) => p.status === 'success')
      .reduce((sum: number, p: any) => sum + (p.amount_ngn || 0), 0);

    return {
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || '',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      subscription_status: sub?.status || 'free',
      plan_id: sub?.plan_id || 'free',
      total_paid_ngn: totalPaid,
      message_count: msgCountMap[u.id] || 0,
      payment_count: userPayments.length,
    };
  });

  // Summary stats
  const stats = {
    total_users: enrichedUsers.length,
    active_subs: enrichedUsers.filter(u => u.subscription_status === 'active').length,
    total_revenue_ngn: enrichedUsers.reduce((s, u) => s + u.total_paid_ngn, 0),
    new_today: enrichedUsers.filter(u => {
      const d = new Date(u.created_at);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length,
  };

  return NextResponse.json({ users: enrichedUsers, stats, payments: payments || [] });
}
