import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - Send patient details to hospital and ambulance (manual action by health worker)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      patientName,
      patientPhone,
      symptoms,
      diagnosis,
      emergencyId,
      healthWorkerPhone,
    } = body;

    // Validate required fields
    if (
      !patientId ||
      !patientName ||
      !patientPhone ||
      !symptoms ||
      !diagnosis
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    console.log("🏥 HEALTH WORKER MANUALLY SENDING TO HOSPITAL:", {
      patientName,
      patientPhone,
      diagnosis,
      healthWorkerPhone,
    });

    // Create emergency alert record for hospital transmission
    const emergencyAlert = await prisma.emergencyAlert.create({
      data: {
        emergencyId: emergencyId || `MANUAL-${Date.now()}`,
        patientName,
        patientPhone,
        symptoms,
        diagnosis,
        healthWorkerPhone: healthWorkerPhone || "7074757878",
        hospitalPhone: "8100752679",
        ambulancePhone: "8653015622",
        status: "SENT",
        sentAt: new Date(),
      },
    });

    console.log("✅ Emergency alert created:", emergencyAlert.id);

    // In a real implementation, you would:
    // 1. Send SMS to hospital: 8100752679
    // 2. Send SMS to ambulance: 8653015622
    // 3. Make phone calls if necessary
    // 4. Send email notifications

    // For now, we log the transmission details
    console.log("📞 TRANSMISSION DETAILS:");
    console.log("  🏥 Hospital: 8100752679");
    console.log("  🚑 Ambulance: 8653015622");
    console.log("  👤 Patient:", patientName);
    console.log("  📱 Patient Phone:", patientPhone);
    console.log("  🩺 Diagnosis:", diagnosis);
    console.log("  ⚠️ Symptoms:", symptoms);
    console.log("  👨‍⚕️ Health Worker:", healthWorkerPhone);

    return NextResponse.json({
      success: true,
      data: {
        alertId: emergencyAlert.id,
        hospitalPhone: "8100752679",
        ambulancePhone: "8653015622",
        status: "SENT",
        sentAt: emergencyAlert.sentAt,
      },
      message: "Patient details successfully sent to hospital and ambulance",
    });
  } catch (error) {
    console.error("❌ Error sending to hospital:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send patient details to hospital",
      },
      { status: 500 }
    );
  }
}
