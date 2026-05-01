import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Check auth
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Check role
    if (!["GENERAL_AFFAIR", "CEO", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month"); // format: YYYY-MM
    const search = searchParams.get("search") || "";

    if (!month) {
      return NextResponse.json({ success: false, message: "Month parameter required" }, { status: 400 });
    }

    // Calculate date range
    const startDate = `${month}-01`;
    const endDate = new Date(month + "-01");
    endDate.setMonth(endDate.getMonth() + 1);
    const endDateStr = endDate.toISOString().split("T")[0];

    // Query approved overtime requests (without joins first)
    const { data: requests, error } = await supabaseAdmin
      .from("overtime_requests")
      .select("*")
      .eq("approval_status", "approved")
      .gte("created_at", startDate)
      .lt("created_at", endDateStr)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching overtime recap:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    if (!requests || requests.length === 0) {
      return NextResponse.json({ success: true, data: [], month });
    }

    // Get unique user IDs
    const userIds = [...new Set(requests.map((r: any) => r.user_id))];
    
    // Fetch users data
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id, name, email")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ success: false, message: usersError.message }, { status: 500 });
    }

    // Get unique session IDs
    const sessionIds = requests.map((r: any) => r.session_id).filter(Boolean);
    
    // Fetch sessions data
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("overtime_sessions")
      .select("id, start_time, end_time")
      .in("id", sessionIds);

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      return NextResponse.json({ success: false, message: sessionsError.message }, { status: 500 });
    }

    // Create lookup maps
    const userMap = new Map(users?.map(u => [u.id, u]) || []);
    const sessionMap = new Map(sessions?.map(s => [s.id, s]) || []);

    // Group by user
    const userMap2 = new Map<string, {
      userId: string;
      userName: string;
      userEmail: string;
      totalMinutes: number;
      totalDays: number;
      details: Array<{
        date: string;
        startTime: string;
        endTime: string;
        durationMinutes: number;
        location: string;
      }>;
    }>();

    requests?.forEach((request: any) => {
      const userId = request.user_id;
      const user = userMap.get(userId);
      const userName = user?.name || user?.email || "Unknown";
      const userEmail = user?.email || "";
      
      const session = sessionMap.get(request.session_id);
      
      // Parse duration interval (format: HH:MM:SS or similar)
      const durationStr = request.duration;
      let durationMinutes = 0;
      
      // Try to parse PostgreSQL interval format
      if (typeof durationStr === 'string') {
        const parts = durationStr.split(':');
        if (parts.length >= 2) {
          const hours = parseInt(parts[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          durationMinutes = hours * 60 + minutes;
        }
      }

      // Fallback: calculate from start_time and end_time
      if (durationMinutes === 0 && session) {
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        const durationMs = end.getTime() - start.getTime();
        durationMinutes = Math.floor(durationMs / 60000);
      }

      if (!userMap2.has(userId)) {
        userMap2.set(userId, {
          userId,
          userName,
          userEmail,
          totalMinutes: 0,
          totalDays: 0,
          details: []
        });
      }

      const userData = userMap2.get(userId)!;
      userData.totalMinutes += durationMinutes;
      userData.totalDays += 1;
      
      const startTime = session?.start_time 
        ? new Date(session.start_time)
        : new Date(request.created_at);
      const endTime = session?.end_time
        ? new Date(session.end_time)
        : new Date(request.created_at);

      userData.details.push({
        date: new Date(request.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
        startTime: startTime.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        endTime: endTime.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        durationMinutes,
        location: request.location || "-"
      });
    });

    // Convert to array and filter by search
    let result = Array.from(userMap2.values());
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(user => 
        user.userName.toLowerCase().includes(searchLower) ||
        user.userEmail.toLowerCase().includes(searchLower)
      );
    }

    // Sort by name
    result.sort((a, b) => a.userName.localeCompare(b.userName));

    return NextResponse.json({ 
      success: true, 
      data: result,
      month
    });

  } catch (error) {
    console.error("Error in overtime recap API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
