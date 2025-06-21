import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // Get basic stats
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    const healthWorkerCount = await prisma.healthWorker.count();

    return NextResponse.json({
      status: "connected",
      message: "Database connection successful",
      stats: {
        totalUsers: userCount,
        patients: patientCount,
        healthWorkers: healthWorkerCount,
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
