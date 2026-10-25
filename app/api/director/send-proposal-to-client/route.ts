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
    const { client_name, client_email, proposal_id, title, scope, deliverables, timeline } = body;
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
        const comps = [
          profile.company_name,
          profile.primary_contact_name,
          profile.primary_contact_email?.split('@')[0]
        ].filter(Boolean).map(normalizeMatchValue);
        return comps.some(value => value && value === normalizeMatchValue(trimmedClientName));
      });
      matchedClientId = nameMatch?.user_id || null;
    }

    if (!matchedClientId && trimmedClientName) {
      const fuzzyMatch = allProfiles?.find((profile: any) => {
        const comps = [
          profile.company_name,
          profile.primary_contact_name,
          profile.primary_contact_email?.split('@')[0]
        ].filter(Boolean).map(normalizeMatchValue);
        return comps.some(value => value && value.includes(normalizeMatchValue(trimmedClientName)));
      });
      matchedClientId = fuzzyMatch?.user_id || null;
    }

    console.log('Client portal match result:', { trimmedClientName, trimmedClientEmail, matchedClientId, allProfiles: allProfiles?.length || 0 });

    const { data: project, error: projectError } = await supabase
      .from('client_projects')
      .insert([{
        director_id: user.id,
        client_id: matchedClientId,
        client_name: trimmedClientName,
        project_name: title,
        description: scope,
        status: 'Active',
        progress_percentage: 0,
        start_date: new Date().toISOString()
      }])
      .select();

    if (projectError) {
      console.error('Project insert failed:', projectError);
      return NextResponse.json({ error: projectError.message }, { status: 400 });
    }

    const projectId = project?.[0]?.id;
    const deliverableItems = String(deliverables || '')
      .split('\n')
      .map((d: string) => d.trim())
      .filter(Boolean);

    if (projectId && deliverableItems.length > 0) {
      const payload = deliverableItems.map((deliverable: string) => ({
        project_id: projectId,
        title: deliverable,
        status: 'ready-for-review'
      }));

      const { error: delError } = await supabase.from('project_deliverables').insert(payload);
      if (delError) {
        console.error('Error inserting deliverables:', delError);
      }
    }

    return NextResponse.json({
      success: true,
      project: project?.[0],
      message: `Project "${title}" sent to ${trimmedClientName}'s portal.`
    });
  } catch (err) {
    console.error('Send proposal route failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
