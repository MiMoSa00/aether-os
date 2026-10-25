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

    // Get projects by client_id
    const { data: projectsByClientId, error: error1 } = await supabase
      .from('client_projects')
      .select(`
        id,
        project_name,
        description,
        status,
        phase,
        progress_percentage,
        start_date,
        end_date,
        project_deliverables (
          id,
          title,
          status,
          description,
          file_url
        )
      `)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    // Also get by client_name matching (for when client_id is null)
    let projectsByName: any[] = [];
    if (profile?.company_name) {
      const { data: byName } = await supabase
        .from('client_projects')
        .select(`
          id,
          project_name,
          description,
          status,
          phase,
          progress_percentage,
          start_date,
          end_date,
          project_deliverables (
            id,
            title,
            status,
            description,
            file_url
          )
        `)
        .eq('client_name', profile.company_name)
        .order('created_at', { ascending: false });
      projectsByName = byName || [];
    }

    // Merge and deduplicate
    const allProjects = [...(projectsByClientId || []), ...projectsByName];
    const projects = Array.from(new Map(allProjects.map(p => [p.id, p])).values());
    const error = error1;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(projects);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
