import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    console.log("📋 PATIENT API: Fetching records for phone:", phone);

    // Find user by phone
    const user = await prisma.user.findFirst({
      where: { phone: phone },
      include: {
        patient: {
          include: {
            // Medical records
            records: {
              include: {
                healthWorker: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            // Monitoring records
            monitoring: {
              include: {
                alerts: {
                  orderBy: { createdAt: "desc" },
                },
              },
            },
            // Emergency info
            emergencyInfo: true,
            // Health reminders
            healthReminders: {
              where: { status: "active" },
              orderBy: { createdAt: "desc" },
            },
            // Uploaded documents
            uploadedDocuments: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!user || !user.patient) {
      console.log("❌ PATIENT API: No patient found for phone:", phone);
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    console.log("✅ PATIENT API: Found patient:", user.patient.id);

    // Fetch emergency alerts related to this patient
    const emergencyAlerts = await prisma.emergencyAlert.findMany({
      where: {
        patientPhone: phone,
      },
      orderBy: { sentAt: "desc" },
    });

    const response = {
      success: true,
      data: {
        patient: {
          id: user.patient.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          age: user.patient.age,
          address: user.patient.address,
        },
        medicalRecords: user.patient.records || [],
        monitoring: user.patient.monitoring,
        emergencyAlerts: emergencyAlerts,
        emergencyInfo: user.patient.emergencyInfo,
        healthReminders: user.patient.healthReminders || [],
        uploadedDocuments: user.patient.uploadedDocuments || [],
      },
    };

    console.log(
      `📋 PATIENT API: Returning ${
        user.patient.records?.length || 0
      } medical records`
    );
    console.log(
      `📋 PATIENT API: Returning ${emergencyAlerts.length} emergency alerts`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.log("❌ PATIENT API: Error fetching patient records:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch patient records",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
