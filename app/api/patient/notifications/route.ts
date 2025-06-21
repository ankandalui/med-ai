import { NextRequest, NextResponse } from "next/server";

// GET - Retrieve notifications for dashboard (static/mock data for demo)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId") || "temp-patient-id";
    const type = searchParams.get("type"); // 'all', 'unread', 'read'

    // Mock notifications for demo purposes
    const mockNotifications = [
      {
        id: "1",
        type: "appointment",
        title: "🏥 Upcoming Doctor Appointment",
        message:
          "Your next visit with Dr. Smith is scheduled for tomorrow at 2:00 PM.",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: "high",
        icon: "🩺",
        actionUrl: "/patient/reminders",
      },
      {
        id: "2",
        type: "medication",
        title: "💊 Medication Reminder",
        message: "Time to take your blood pressure medication.",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: "medium",
        icon: "⏰",
        actionUrl: "/patient/reminders",
      },
      {
        id: "3",
        type: "vaccination",
        title: "💉 Vaccination Due",
        message: "Your annual flu vaccination is due next week.",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        priority: "medium",
        icon: "🩹",
        actionUrl: "/patient/vaccination",
      },
      {
        id: "4",
        type: "document",
        title: "📄 New Lab Report Available",
        message: "Your blood test results have been uploaded to your locker.",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        priority: "low",
        icon: "📋",
        actionUrl: "/patient/locker",
      },
      {
        id: "5",
        type: "checkup",
        title: "🔬 Health Checkup Reminder",
        message: "Your quarterly health checkup is scheduled for next month.",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        priority: "low",
        icon: "🏥",
        actionUrl: "/patient/reminders",
      },
    ];

    // Filter based on type
    let filteredNotifications = mockNotifications;
    if (type === "unread") {
      filteredNotifications = mockNotifications.filter((n) => !n.isRead);
    } else if (type === "read") {
      filteredNotifications = mockNotifications.filter((n) => n.isRead);
    }

    // Sort by date (newest first)
    filteredNotifications.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const stats = {
      total: mockNotifications.length,
      unread: mockNotifications.filter((n) => !n.isRead).length,
      read: mockNotifications.filter((n) => n.isRead).length,
      highPriority: mockNotifications.filter((n) => n.priority === "high")
        .length,
    };

    return NextResponse.json({
      success: true,
      data: filteredNotifications,
      stats,
      message: "Notifications retrieved successfully",
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get notifications",
      },
      { status: 500 }
    );
  }
}

// PUT - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would update the database
    // For demo purposes, just return success
    return NextResponse.json({
      success: true,
      data: { id, isRead: isRead ?? true },
      message: "Notification status updated successfully",
    });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update notification",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would delete from database
    // For demo purposes, just return success
    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete notification",
      },
      { status: 500 }
    );
  }
}
