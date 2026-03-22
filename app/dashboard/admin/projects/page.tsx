import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'
import ProjectManagementClient from './ProjectManagementClient'

export default async function ProjectManagePage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only PM, HRD, CEO, ADMIN can manage projects
  if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  let projects = []
  let divisions = []

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all projects with division info
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        createdAt,
        updatedAt,
        startDate,
        endDate,
        isActive,
        divisionId,
        divisions!inner(name, color)
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false })

    if (projectsError) {
      console.error('Failed to fetch projects:', projectsError)
      projects = []
    } else {
      projects = (projectsData || []).map(project => ({
        ...project,
        reportCount: 0, // Set to 0 for now, will calculate later if needed
        division: project.divisions // Map divisions to division for compatibility
      }))
    }

    // Get all divisions
    const { data: divisionsData, error: divisionsError } = await supabase
      .from('divisions')
      .select('id, name, color')
      .order('name', { ascending: true })

    if (divisionsError) {
      console.error('Failed to fetch divisions:', divisionsError)
      divisions = []
    } else {
      divisions = divisionsData || []
    }

  } catch (error) {
    console.error('Failed to fetch projects or divisions:', error)
    projects = []
    divisions = []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectManagementClient 
        projects={projects}
        divisions={divisions}
        currentUserRole={session.role}
      />
    </div>
  )
}