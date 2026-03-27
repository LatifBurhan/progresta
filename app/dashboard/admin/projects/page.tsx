import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import ProjectManagementClient from "./ProjectManagementClient";

export default async function ProjectManagePage() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  let projects = [];
  let divisions = [];

  try {
    if (!supabaseAdmin) {
      console.error("Supabase admin client not configured");
      projects = [];
      divisions = [];
    } else {
      // Fetch projects with divisions (Many-to-Many)
      const { data: projectsResult, error: projectsError } = await supabaseAdmin
        .from("projects")
        .select(
          `
          *,
          project_divisions (
            division_id,
            divisions (
              id,
              name,
              color
            )
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error("Failed to fetch projects:", projectsError);
        projects = [];
      } else {
        projects = (projectsResult || []).map((p: any) => ({
          ...p,
          // Fallback for old data mapping
          tanggal_mulai: p.tanggal_mulai || p.startDate,
          tanggal_selesai: p.tanggal_selesai || p.endDate,
          status: p.status || (p.isActive ? "Aktif" : "Non-Aktif"),
          divisions: p.project_divisions?.map((pd: any) => pd.divisions).filter(Boolean) || [],
        }));
      }

      // Get all divisions (remove isActive filter temporarily to debug)
      const { data: divisionsResult, error: divisionsError } = await supabaseAdmin.from("divisions").select("*").order("name");

      if (divisionsError) {
        console.error("Failed to fetch divisions:", divisionsError);
        divisions = [];
      } else {
        divisions = (divisionsResult || []).map((d: any) => ({
          ...d,
          is_active: d.isActive !== undefined ? d.isActive : true, // Fallback to true if column missing or null
        }));
      }
    }
  } catch (error) {
    console.error("Failed to fetch projects or divisions:", error);
    projects = [];
    divisions = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectManagementClient projects={projects} divisions={divisions} />
    </div>
  );
}
