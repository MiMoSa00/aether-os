import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get client profile to find client_name for matching
    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .select('company_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // Get invoices by client_id
    const { data: invoicesByClientId, error: error1 } = await supabase
      .from('client_invoices')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    // Also get by client_name matching (for when client_id is null)
    let invoicesByName: any[] = [];
    if (profile?.company_name) {
      const { data: byName } = await supabase
        .from('client_invoices')
        .select('*')
        .eq('client_name', profile.company_name)
        .order('created_at', { ascending: false });
      invoicesByName = byName || [];
    }

    // Merge and deduplicate
    const allInvoices = [...(invoicesByClientId || []), ...invoicesByName];
    const invoices = Array.from(new Map(allInvoices.map(i => [i.id, i])).values());
    const error = error1;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(invoices);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { invoice_id, status, paystack_reference } = body;

    // Update invoice status
    const { data: updated, error } = await supabase
      .from('client_invoices')
      .update({
        status,
        paystack_reference,
        paid_date: status === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice_id)
      .eq('client_id', user.id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
