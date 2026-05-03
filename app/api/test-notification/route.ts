import { NextRequest, NextResponse } from "next/server";
import { sendNotification, NotificationTemplates } from "@/lib/notifications";
import { verifySession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { type, userId, projectName, userName } = await request.json();

    // Test different notification types
    switch (type) {
      case "project_assigned":
        await sendNotification(
          NotificationTemplates.projectAssigned(
            projectName || "Test Project",
            userId || session.userId
          )
        );
        break;

      case "project_deadline":
        await sendNotification(
          NotificationTemplates.projectDeadline(
            projectName || "Test Project",
            3,
            [userId || session.userId]
          )
        );
        break;

      case "project_overdue":
        await sendNotification(
          NotificationTemplates.projectOverdue(
            projectName || "Test Project",
            [userId || session.userId]
          )
        );
        break;

      case "report_reminder":
        await sendNotification(
          NotificationTemplates.reportReminder(userId || session.userId)
        );
        break;

      case "report_submitted":
        await sendNotification(
          NotificationTemplates.reportSubmitted(
            userName || "Test User",
            projectName || "Test Project"
          )
        );
        break;

      case "custom":
      default:
        await sendNotification({
          type: "system_alert",
          title: "Test Notification",
          message: "This is a test notification from the API",
          priority: "high",
          userId: userId || session.userId,
          actionUrl: "/dashboard",
        });
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Test notification sent successfully (type: ${type || "custom"})`,
    });
  } catch (error: any) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send test notification: " + error.message,
      },
      { status: 500 }
    );
  }
}
