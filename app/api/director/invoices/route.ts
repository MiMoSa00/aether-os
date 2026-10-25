import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const normalizeMatchValue = (value: string = '') =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { client_name, client_email, invoice_number, description, amount_ngn, due_date } = body;
    const trimmedClientName = String(client_name || '').trim();
    const trimmedClientEmail = String(client_email || '').trim().toLowerCase();

    const { data: allProfiles, error: profileFetchError } = await supabase
      .from('client_profiles')
      .select('user_id, company_name, primary_contact_name, primary_contact_email');

    if (profileFetchError) {
      return NextResponse.json({ error: profileFetchError.message }, { status: 400 });
    }

    let matchedClientId: string | null = null;

    if (trimmedClientEmail) {
      const emailMatch = allProfiles?.find((profile: any) => {
        const candidate = normalizeMatchValue(profile.primary_contact_email || '');
        return candidate && candidate === normalizeMatchValue(trimmedClientEmail);
      });
      matchedClientId = emailMatch?.user_id || null;
    }

    if (!matchedClientId && trimmedClientName) {
      const nameMatch = allProfiles?.find((profile: any) => {
        const comps = [profile.company_name, profile.primary_contact_name, profile.primary_contact_email?.split('@')[0]].filter(Boolean).map(normalizeMatchValue);
        return comps.some(value => value && value === normalizeMatchValue(trimmedClientName));
      });
      matchedClientId = nameMatch?.user_id || null;
    }

    console.log('Invoice client match result:', { trimmedClientName, trimmedClientEmail, matchedClientId, totalProfiles: allProfiles?.length || 0 });

    const { data: invoice, error: invoiceError } = await supabase
      .from('client_invoices')
      .insert([{
        director_id: user.id,
        client_id: matchedClientId,
        client_name: trimmedClientName,
        invoice_number,
        description,
        amount_ngn,
        due_date,
        status: 'unpaid'
      }])
      .select();

    if (invoiceError) {
      console.error('Invoice insert failed:', invoiceError);
      return NextResponse.json({ error: invoiceError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      invoice: invoice?.[0],
      message: `Invoice sent to ${trimmedClientName}`
    });
  } catch (err) {
    console.error('Invoice send failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: invoices, error } = await supabase
      .from('client_invoices')
      .select('*')
      .eq('director_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ invoices });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
