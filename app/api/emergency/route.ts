import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("🚨 EMERGENCY API: Received emergency creation request");

    const body = await request.json();
    console.log(
      "🚨 EMERGENCY API: Request body:",
      JSON.stringify(body, null, 2)
    );

    const {
      emergencyId,
      patientName,
      patientPhone,
      symptoms,
      diagnosis,
      healthWorkerPhone,
      location,
      age,
      status = "PENDING",
    } = body;

    // Validate required fields
    if (!emergencyId || !patientName || !symptoms || !diagnosis) {
      console.log("❌ EMERGENCY API: Missing required fields");
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: emergencyId, patientName, symptoms, diagnosis",
        },
        { status: 400 }
      );
    }

    console.log("✅ EMERGENCY API: Creating emergency alert in database");

    // Create emergency alert in database
    const emergencyAlert = await prisma.emergencyAlert.create({
      data: {
        emergencyId,
        patientName,
        patientPhone: patientPhone || "Unknown",
        symptoms,
        diagnosis,
        healthWorkerPhone: healthWorkerPhone || "Not specified",
        hospitalPhone: "Emergency: 102", // Default emergency number
        ambulancePhone: "Ambulance: 108", // Default ambulance number
        status,
        sentAt: new Date(),
      },
    });

    console.log(
      "✅ EMERGENCY API: Emergency alert created:",
      emergencyAlert.id
    ); // If critical, also create patient monitoring record for health worker dashboard
    if (status === "CRITICAL" || diagnosis.toLowerCase().includes("critical")) {
      console.log(
        "🔥 EMERGENCY API: Creating critical patient monitoring record"
      );

      try {
        // First check if user already exists
        let existingUser = await prisma.user.findUnique({
          where: { phone: patientPhone || `EMG-${Date.now()}` },
          include: { patient: true },
        });

        let patientRecord;

        if (existingUser && existingUser.patient) {
          // User and patient already exist, use existing patient
          patientRecord = existingUser.patient;
          console.log(
            "🔍 EMERGENCY API: Using existing patient record:",
            patientRecord.id
          );
        } else if (existingUser && !existingUser.patient) {
          // User exists but no patient record, create patient record
          patientRecord = await prisma.patient.create({
            data: {
              userId: existingUser.id,
              age: age || null,
              address: location || null,
            },
          });
          console.log(
            "🆕 EMERGENCY API: Created patient record for existing user:",
            patientRecord.id
          );
        } else {
          // Neither user nor patient exist, create both
          const newUser = await prisma.user.create({
            data: {
              email: `${emergencyId.toLowerCase()}@emergency.temp`,
              phone: patientPhone || `EMG-${Date.now()}`,
              name: patientName,
              userType: "PATIENT",
              isVerified: false,
            },
          });

          patientRecord = await prisma.patient.create({
            data: {
              userId: newUser.id,
              age: age || null,
              address: location || null,
            },
          });
          console.log(
            "🆕 EMERGENCY API: Created new user and patient record:",
            patientRecord.id
          );
        }
        const monitoring = await prisma.patientMonitoring.create({
          data: {
            patientId: patientRecord.id,
            symptoms,
            diagnosis,
            status: "critical",
            emergencyId,
            healthWorkerPhone: healthWorkerPhone || "Not specified",
            location: location || "Unknown",
            age: age || null,
            heartRate: 0,
            bloodPressure: "0/0",
            temperature: 0.0,
            weight: 0.0,
          },
        });

        console.log(
          "✅ EMERGENCY API: Patient monitoring created:",
          monitoring.id
        );

        // Create critical alert
        await prisma.patientAlert.create({
          data: {
            patientMonitoringId: monitoring.id,
            type: "CRITICAL",
            message: `🚨 EMERGENCY: ${patientName} requires immediate attention. Symptoms: ${symptoms}`,
          },
        });

        console.log("✅ EMERGENCY API: Critical alert created for monitoring");
      } catch (monitoringError) {
        console.log(
          "⚠️ EMERGENCY API: Failed to create monitoring record:",
          monitoringError
        );
        // Continue even if monitoring creation fails
      }
    }

    console.log(
      "🎯 EMERGENCY API: Emergency processing completed successfully"
    );

    return NextResponse.json({
      success: true,
      data: {
        emergencyId: emergencyAlert.emergencyId,
        alertId: emergencyAlert.id,
        status: emergencyAlert.status,
        message: "Emergency alert created successfully",
      },
    });
  } catch (error) {
    console.log("❌ EMERGENCY API: Error creating emergency:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create emergency alert",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("📋 EMERGENCY API: Fetching emergencies");

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const emergencyId = url.searchParams.get("emergencyId");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    let whereClause: any = {};

    if (emergencyId) {
      whereClause.emergencyId = emergencyId;
      console.log(
        "📋 EMERGENCY API: Fetching specific emergency:",
        emergencyId
      );
    } else if (status) {
      whereClause.status = status;
      console.log(
        "📋 EMERGENCY API: Fetching emergencies with status:",
        status
      );
    }

    const emergencies = await prisma.emergencyAlert.findMany({
      where: whereClause,
      orderBy: {
        sentAt: "desc",
      },
      take: limit,
    });

    console.log(`📋 EMERGENCY API: Found ${emergencies.length} emergencies`);

    return NextResponse.json({
      success: true,
      data: emergencies,
      count: emergencies.length,
    });
  } catch (error) {
    console.log("❌ EMERGENCY API: Error fetching emergencies:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch emergencies",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("🔄 EMERGENCY API: Updating emergency status");

    const body = await request.json();
    const { emergencyId, status } = body;

    if (!emergencyId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing emergencyId or status" },
        { status: 400 }
      );
    }

    const updatedEmergency = await prisma.emergencyAlert.update({
      where: { emergencyId },
      data: { status },
    });

    console.log(
      `✅ EMERGENCY API: Updated emergency ${emergencyId} to status: ${status}`
    );

    return NextResponse.json({
      success: true,
      data: updatedEmergency,
    });
  } catch (error) {
    console.log("❌ EMERGENCY API: Error updating emergency:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update emergency",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
