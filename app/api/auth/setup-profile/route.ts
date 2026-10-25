import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { company_name, full_name, primary_contact_email } = body;
    const resolvedCompanyName = company_name || full_name || user.email?.split('@')[0] || 'Client';
    const resolvedFullName = full_name || company_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client';

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('client_profiles')
        .update({
          company_name: resolvedCompanyName,
          primary_contact_name: resolvedFullName,
          primary_contact_email: primary_contact_email || user.email
        })
        .eq('user_id', user.id)
        .select();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      return NextResponse.json({ profile: updated?.[0], isNew: false });
    }

    // Create new profile
    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .insert([{
        user_id: user.id,
        company_name: resolvedCompanyName,
        primary_contact_name: resolvedFullName,
        primary_contact_email: primary_contact_email || user.email
      }])
      .select();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ profile: profile?.[0], isNew: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
