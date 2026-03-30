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
    } else {
      // Fetch projects with divisions (Many-to-Many)
      const { data: projectsResult, error: projectsError } = await supabaseAdmin
        .from("projects")
        .select(`
          *,
          project_divisions (
            division_id,
            divisions (
              id,
              name,
              color
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (!projectsError) {
        projects = (projectsResult || []).map((p: any) => ({
          ...p,
          tanggal_mulai: p.tanggal_mulai || p.startDate,
          tanggal_selesai: p.tanggal_selesai || p.endDate,
          status: p.status || (p.isActive ? "Aktif" : "Non-Aktif"),
          divisions: p.project_divisions?.map((pd: any) => pd.divisions).filter(Boolean) || [],
        }));
      }

      // Fetch all divisions
      const { data: divisionsResult, error: divisionsError } = await supabaseAdmin
        .from("divisions")
        .select("*")
        .order("name");

      if (!divisionsError) {
        divisions = (divisionsResult || []).map((d: any) => ({
          ...d,
          is_active: d.isActive !== undefined ? d.isActive : true,
        }));
      }
    }
  } catch (error) {
    console.error("Critical error fetching data:", error);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8 py-6 md:py-10">
        <ProjectManagementClient 
          projects={projects} 
          divisions={divisions} 
        />
      </div>

      {/* Decorative Blur (Background) */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
}