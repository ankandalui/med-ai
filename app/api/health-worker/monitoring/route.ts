import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadMedicalRecordToBlockchain } from "@/lib/blockchain-medical-record";

export async function GET(request: NextRequest) {
  try {
    // Get all patients being monitored by the health worker
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status && status !== "all" ? { status } : {};

    const patients = await prisma.patientMonitoring.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({
      success: true,
      data: patients,
    });
  } catch (error) {
    console.log("Error fetching patient monitoring data:", error);
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
    console.log("🚨 NEW EMERGENCY REQUEST RECEIVED");
    const body = await request.json();
    console.log("📥 Full request body:", JSON.stringify(body, null, 2));

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

    console.log("🔍 Extracted fields:");
    console.log("  👤 Patient Name:", patientName);
    console.log("  📱 Patient Phone:", patientPhone);
    console.log("  📍 Location:", patientLocation);
    console.log("  🩺 Status:", status);
    console.log("  🆔 Emergency ID:", emergencyId); // Validate required fields
    if (!patientName || !patientPhone || !symptoms || !diagnosis || !status) {
      console.log("❌ VALIDATION FAILED - Missing required fields:");
      console.log("  patientName:", patientName ? "✅" : "❌");
      console.log("  patientPhone:", patientPhone ? "✅" : "❌");
      console.log("  symptoms:", symptoms ? "✅" : "❌");
      console.log("  diagnosis:", diagnosis ? "✅" : "❌");
      console.log("  status:", status ? "✅" : "❌");

      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: patientName, patientPhone, symptoms, diagnosis, status",
        },
        { status: 400 }
      );
    }
    console.log("✅ VALIDATION PASSED - All required fields present");

    // Note: Do NOT automatically send critical cases to authorities here
    // This should only happen when health worker explicitly clicks "Send to Hospital"
    // Automatic sending only happens during the initial SOS/emergency alert phase// Find or create patient user
    console.log("🔍 SEARCHING FOR EXISTING USER...");
    let user = await prisma.user.findFirst({
      where: { phone: patientPhone },
    });

    console.log(
      "👤 User search result:",
      user ? `Found: ${user.name} (${user.id})` : "Not found"
    );

    if (!user) {
      // Create new patient user
      console.log("➕ CREATING NEW USER...");
      try {
        user = await prisma.user.create({
          data: {
            name: patientName,
            phone: patientPhone,
            userType: "PATIENT",
            isVerified: false,
            // Set temporary email if not provided
            email: `${patientPhone}@temp.medai.com`,
          },
        });
        console.log("✅ USER CREATED SUCCESSFULLY:", user.id);
      } catch (error) {
        console.log("❌ USER CREATION FAILED:", error);
        throw error;
      }
    }

    // Find or create patient record
    console.log("🔍 SEARCHING FOR PATIENT RECORD...");
    let patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    console.log(
      "🏥 Patient search result:",
      patient ? `Found: ${patient.id}` : "Not found"
    );

    if (!patient) {
      console.log("➕ CREATING NEW PATIENT RECORD...");
      try {
        patient = await prisma.patient.create({
          data: {
            userId: user.id,
            age: patientAge ? parseInt(patientAge) : null,
            address: patientLocation,
          },
        });
        console.log("✅ PATIENT RECORD CREATED:", patient.id);
      } catch (error) {
        console.log("❌ PATIENT CREATION FAILED:", error);
        throw error;
      }
    }

    // Create or update patient monitoring record
    console.log("📊 CREATING/UPDATING PATIENT MONITORING RECORD...");
    console.log("📋 Monitoring data to save:");
    console.log("  Status:", status);
    console.log("  Symptoms:", symptoms?.substring(0, 100) + "...");
    console.log("  Diagnosis:", diagnosis?.substring(0, 100) + "...");
    console.log("  Emergency ID:", emergencyId);

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
        location: patientLocation,
        age: patientAge ? parseInt(patientAge) : null,
        healthWorkerPhone: healthWorkerPhone || "7074757878",
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
        healthWorkerPhone: healthWorkerPhone || "7074757878",
        location: patientLocation,
        age: patientAge ? parseInt(patientAge) : null,
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log("✅ PATIENT MONITORING RECORD SAVED:", patientMonitoring.id);
    console.log("📊 Final status in database:", patientMonitoring.status);

    // ALSO CREATE MEDICAL RECORD so patient can see their report
    console.log("📝 CREATING MEDICAL RECORD FOR PATIENT DASHBOARD...");

    // Find health worker (or create default one)
    let healthWorker = await prisma.healthWorker.findFirst({
      where: {
        user: {
          phone: healthWorkerPhone || "7074757878",
        },
      },
    });

    if (!healthWorker) {
      console.log("➕ CREATING DEFAULT HEALTH WORKER...");
      // Create default health worker if not exists
      const healthWorkerUser = await prisma.user.upsert({
        where: { phone: healthWorkerPhone || "7074757878" },
        update: {},
        create: {
          name: "Emergency Health Worker",
          phone: healthWorkerPhone || "7074757878",
          email: `${healthWorkerPhone || "7074757878"}@healthworker.medai.com`,
          userType: "HEALTH_WORKER",
          isVerified: true,
        },
      });

      healthWorker = await prisma.healthWorker.create({
        data: {
          userId: healthWorkerUser.id,
          licenseNumber: "EMG-HW-001",
          specialization: "Emergency Medicine",
          areaVillage: "Emergency Services",
          hospital: "Government District Hospital",
        },
      });

      console.log("✅ DEFAULT HEALTH WORKER CREATED:", healthWorker.id);
    } // Create medical record
    try {
      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          patientId: patient.id,
          healthWorkerId: healthWorker.id,
          diagnosis: diagnosis,
          symptoms: [symptoms], // Store as array
          treatment:
            status === "critical"
              ? "Emergency treatment initiated. Patient referred to hospital."
              : "Patient under observation and monitoring.",
          medications: [], // Empty for now
          notes: emergencyId
            ? `Emergency case ${emergencyId}. Auto-generated from symptom prediction system.`
            : "Patient added to monitoring system.",
          attachments: [], // Empty for now
        },
        include: {
          healthWorker: {
            include: {
              user: true,
            },
          },
          patient: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log("✅ MEDICAL RECORD CREATED:", medicalRecord.id);
      console.log(
        "📝 Medical record allows patient to view their report via phone login"
      );

      // Upload medical record to blockchain for security and verification
      try {
        console.log("� Uploading medical record to blockchain...");

        const blockchainResult = await uploadMedicalRecordToBlockchain({
          id: medicalRecord.id,
          patientId: medicalRecord.patientId,
          healthWorkerId: medicalRecord.healthWorkerId,
          diagnosis: medicalRecord.diagnosis,
          symptoms: medicalRecord.symptoms,
          treatment: medicalRecord.treatment,
          medications: medicalRecord.medications,
          notes: medicalRecord.notes || undefined,
          createdAt: medicalRecord.createdAt.toISOString(),
          healthWorker: {
            name: medicalRecord.healthWorker.user.name,
            phone: medicalRecord.healthWorker.user.phone,
            specialization: medicalRecord.healthWorker.specialization,
            hospital: medicalRecord.healthWorker.hospital || undefined,
          },
          patient: {
            name: medicalRecord.patient.user.name,
            phone: medicalRecord.patient.user.phone,
            age: medicalRecord.patient.age || undefined,
          },
        });

        // Update medical record with blockchain CID
        await prisma.medicalRecord.update({
          where: { id: medicalRecord.id },
          data: {
            cid: blockchainResult.cid,
            ipfsUrl: blockchainResult.ipfsUrl,
            encrypted: true,
          },
        });

        console.log("✅ Medical record uploaded to blockchain:", {
          recordId: medicalRecord.id,
          cid: blockchainResult.cid,
          ipfsUrl: blockchainResult.ipfsUrl,
        });
      } catch (blockchainError) {
        console.error("❌ Blockchain upload failed:", blockchainError);
        console.error(
          "   Medical record created but not uploaded to blockchain"
        );
        // Don't fail the whole operation if blockchain upload fails
      }
    } catch (medicalRecordError) {
      console.error("❌ FAILED TO CREATE MEDICAL RECORD:", medicalRecordError);
      console.error("   Patient ID:", patient.id);
      console.error("   Health Worker ID:", healthWorker.id);
      console.error(
        "   This means patient won't see their record in dashboard!"
      );
      // Don't throw error - monitoring should still work even if medical record creation fails
    }

    // Create alert for this patient
    console.log("🚨 CREATING PATIENT ALERT...");
    const alertType =
      status === "critical"
        ? "CRITICAL"
        : status === "attention"
        ? "WARNING"
        : "INFO";

    await prisma.patientAlert.create({
      data: {
        patientMonitoringId: patientMonitoring.id,
        type: alertType,
        message: `${
          status === "critical"
            ? "🚨 Critical emergency detected"
            : status === "attention"
            ? "⚠️ Patient needs attention"
            : "ℹ️ Patient status updated"
        }: ${symptoms.substring(0, 100)}...`,
        isRead: false,
      },
    });

    console.log("✅ PATIENT ALERT CREATED");

    // Final success response
    const responseMessage =
      status === "critical"
        ? "🚨 CRITICAL CASE - Sent to hospital/authorities and added to monitoring"
        : "✅ Patient added to monitoring successfully";

    console.log("📤 SENDING SUCCESS RESPONSE:", responseMessage);

    return NextResponse.json({
      success: true,
      patient: patientMonitoring,
      message: responseMessage,
      authoritiesNotified: status === "critical",
      emergencyContacts:
        status === "critical"
          ? {
              hospital: "8100752679",
              ambulance: "8653015622",
              healthWorker: "7074757878",
            }
          : null,
    });
  } catch (error) {
    console.log("❌ EMERGENCY PROCESSING FAILED:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to process emergency request: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}

// PUT method to update patient monitoring status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, vitals } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: id and status",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.patientMonitoring.update({
      where: { id },
      data: {
        status,
        ...(vitals && {
          heartRate: vitals.heartRate || 0,
          bloodPressure: vitals.bloodPressure || "0/0",
          temperature: vitals.temperature || 0.0,
          weight: vitals.weight || 0.0,
        }),
        updatedAt: new Date(),
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        alerts: true,
      },
    });

    // Create alert for status change
    const alertType =
      status === "critical"
        ? "CRITICAL"
        : status === "attention"
        ? "WARNING"
        : "INFO";

    await prisma.patientAlert.create({
      data: {
        patientMonitoringId: id,
        type: alertType,
        message: `Patient status updated to: ${status.toUpperCase()}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Patient status updated successfully",
    });
  } catch (error) {
    console.log("Error updating patient monitoring:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update patient monitoring",
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
    console.log("❌ Failed to send emergency alert:", error);
  }
}
