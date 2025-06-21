import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get all patients being monitored by the health worker
    const patients = await prisma.patientMonitoring.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            emergencyContact: true,
          },
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error("Error fetching patient monitoring data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch patient monitoring data",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientName,
      patientPhone,
      patientAge,
      patientLocation,
      symptoms,
      diagnosis,
      status,
      emergencyId,
      healthWorkerPhone,
    } = body;

    // Validate required fields
    if (!patientName || !patientPhone || !symptoms || !diagnosis || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Find or create patient
    let patient = await prisma.user.findFirst({
      where: { phone: patientPhone },
    });

    if (!patient) {
      // Create new patient user
      patient = await prisma.user.create({
        data: {
          name: patientName,
          phone: patientPhone,
          role: "PATIENT",
          isVerified: false,
          // Set temporary email if not provided
          email: `${patientPhone}@temp.medai.com`,
        },
      });
    }

    // Create or update patient monitoring record
    const patientMonitoring = await prisma.patientMonitoring.upsert({
      where: { patientId: patient.id },
      update: {
        status,
        heartRate: 0, // Will be updated with real vitals later
        bloodPressure: "0/0",
        temperature: 0,
        weight: 0,
        symptoms,
        diagnosis,
        emergencyId,
        updatedAt: new Date(),
      },
      create: {
        patientId: patient.id,
        status,
        heartRate: 0,
        bloodPressure: "0/0", 
        temperature: 0,
        weight: 0,
        symptoms,
        diagnosis,
        emergencyId,
        healthWorkerPhone,
        location: patientLocation,
        age: patientAge,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Create alert for this patient
    await prisma.patientAlert.create({
      data: {
        patientMonitoringId: patientMonitoring.id,
        type: status === "critical" ? "CRITICAL" : status === "attention" ? "WARNING" : "INFO",
        message: `${status === "critical" ? "🚨 Critical emergency detected" : "⚠️ Patient needs attention"}: ${symptoms.substring(0, 100)}...`,
        isRead: false,
      },
    });

    // Send to hospital/authorities if critical
    if (status === "critical") {
      await sendToAuthorities({
        patientName,
        patientPhone,
        symptoms,
        diagnosis,
        emergencyId,
        healthWorkerPhone,
        hospitalPhone: "8100752679",
        ambulancePhone: "8653015622",
      });
    }

    return NextResponse.json({
      success: true,
      patient: patientMonitoring,
      message: "Patient added successfully",
    });
  } catch (error) {
    console.error("Error adding patient to monitoring:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add patient to monitoring",
      },
      { status: 500 }
    );
  }
}

// Helper function to send data to authorities
async function sendToAuthorities(data: any) {
  try {
    console.log("🚨 SENDING TO AUTHORITIES:", data);
    
    // In a real implementation, you would send SMS/call to hospital and ambulance
    // For now, we'll log it and store in the database
    
    await prisma.emergencyAlert.create({
      data: {
        emergencyId: data.emergencyId,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        healthWorkerPhone: data.healthWorkerPhone,
        hospitalPhone: data.hospitalPhone,
        ambulancePhone: data.ambulancePhone,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    console.log("✅ Emergency alert sent to authorities");
  } catch (error) {
    console.error("❌ Failed to send emergency alert:", error);
  }
}
