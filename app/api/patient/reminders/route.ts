import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Retrieve all reminders for a patient
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId") || "temp-patient-id";
    const status = searchParams.get("status"); // optional filter

    const whereClause: any = { patientId };
    if (status) {
      whereClause.status = status;
    }

    const reminders = await prisma.healthReminder.findMany({
      where: whereClause,
      orderBy: [
        { status: "asc" }, // active first
        { date: "asc" },
        { time: "asc" },
      ],
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: reminders,
      count: reminders.length,
      message: "Reminders retrieved successfully",
    });
  } catch (error) {
    console.error("Get reminders error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get reminders",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new reminder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      type,
      title,
      description,
      date,
      time,
      frequency,
      priority,
    } = body;

    if (!patientId || !type || !title || !date || !time) {
      return NextResponse.json(
        { error: "Patient ID, type, title, date, and time are required" },
        { status: 400 }
      );
    }

    const reminder = await prisma.healthReminder.create({
      data: {
        patientId,
        type,
        title,
        description: description || "",
        date,
        time,
        frequency: frequency || "once",
        priority: priority || "medium",
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      data: reminder,
      message: "Reminder created successfully",
    });
  } catch (error) {
    console.error("Create reminder error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create reminder",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update a reminder
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      type,
      title,
      description,
      date,
      time,
      frequency,
      priority,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Reminder ID is required" },
        { status: 400 }
      );
    }

    const reminder = await prisma.healthReminder.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date }),
        ...(time && { time }),
        ...(frequency && { frequency }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(status === "completed" && { lastNotified: new Date() }),
      },
    });

    return NextResponse.json({
      success: true,
      data: reminder,
      message: "Reminder updated successfully",
    });
  } catch (error) {
    console.error("Update reminder error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update reminder",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a reminder
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Reminder ID is required" },
        { status: 400 }
      );
    }

    await prisma.healthReminder.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    console.error("Delete reminder error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete reminder",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
