import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadMedicalRecordToBlockchain } from "@/lib/blockchain-medical-record";

const prisma = new PrismaClient();

// GET - Fetch all patient records including monitoring data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    // Fetch medical records
    const whereConditions: any = {};

    if (search) {
      whereConditions.OR = [
        {
          patient: {
            user: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          diagnosis: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: whereConditions,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch patient monitoring records
    const monitoringRecords = await prisma.patientMonitoring.findMany({
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
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Fetch emergency alerts
    const emergencyAlerts = await prisma.emergencyAlert.findMany({
      orderBy: {
        sentAt: "desc",
      },
    });

    // Transform data for records view
    const transformedRecords = [
      // Medical records
      ...medicalRecords.map((record) => ({
        id: record.id,
        patientName: record.patient.user.name,
        patientId: record.patientId,
        patientPhone: record.patient.user.phone,
        recordType: "medical_record" as const,
        title: `Medical Consultation - ${record.diagnosis}`,
        description: record.symptoms.join(", "),
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        medications: record.medications,
        notes: record.notes,
        date: record.createdAt.toISOString(),
        lastAccessed: record.updatedAt.toISOString(),
        status: "active" as const,
        healthWorker: record.healthWorker?.user?.name || "AI System",
        healthWorkerPhone: record.healthWorker?.user?.phone || "system",
      })),

      // Monitoring records
      ...monitoringRecords.map((monitor) => ({
        id: monitor.id,
        patientName: monitor.patient.user.name,
        patientId: monitor.patientId,
        patientPhone: monitor.patient.user.phone,
        recordType: "monitoring" as const,
        title: `Patient Monitoring - ${monitor.status.toUpperCase()}`,
        description: monitor.symptoms || "Continuous monitoring",
        diagnosis: monitor.diagnosis,
        symptoms: monitor.symptoms,
        location: monitor.location,
        age: monitor.age,
        emergencyId: monitor.emergencyId,
        status: monitor.status,
        heartRate: monitor.heartRate,
        bloodPressure: monitor.bloodPressure,
        temperature: monitor.temperature,
        weight: monitor.weight,
        date: monitor.createdAt.toISOString(),
        lastAccessed: monitor.updatedAt.toISOString(),
        healthWorkerPhone: monitor.healthWorkerPhone,
        alerts: monitor.alerts,
      })),

      // Emergency alerts
      ...emergencyAlerts.map((alert) => ({
        id: alert.id,
        patientName: alert.patientName,
        patientId: alert.id, // Using alert id as fallback
        patientPhone: alert.patientPhone,
        recordType: "emergency" as const,
        title: `Emergency Alert - ${alert.emergencyId}`,
        description: alert.symptoms,
        diagnosis: alert.diagnosis,
        symptoms: alert.symptoms,
        emergencyId: alert.emergencyId,
        status: alert.status.toLowerCase(),
        date: alert.sentAt.toISOString(),
        lastAccessed: alert.sentAt.toISOString(),
        healthWorkerPhone: alert.healthWorkerPhone,
        hospitalPhone: alert.hospitalPhone,
        ambulancePhone: alert.ambulancePhone,
      })),
    ];

    // Apply type filter if specified
    let filteredRecords = transformedRecords;
    if (type && type !== "all") {
      if (type === "recent") {
        // Recent records from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filteredRecords = transformedRecords.filter(
          (record) => new Date(record.date) >= sevenDaysAgo
        );
      } else {
        filteredRecords = transformedRecords.filter(
          (record) => record.recordType === type
        );
      }
    }

    // Sort by date (newest first)
    filteredRecords.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredRecords,
      total: filteredRecords.length,
      medical_records: medicalRecords.length,
      monitoring_records: monitoringRecords.length,
      emergency_alerts: emergencyAlerts.length,
    });
  } catch (error) {
    console.error("Error fetching patient records:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch patient records",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new medical record from disease prediction
export async function POST(request: NextRequest) {
  try {
    console.log("📝 NEW MEDICAL RECORD REQUEST RECEIVED");
    const body = await request.json();
    console.log("📥 Request body:", JSON.stringify(body, null, 2));

    const {
      patientName,
      patientPhone,
      patientAge,
      patientLocation,
      diagnosis,
      symptoms,
      treatment,
      medications,
      notes,
      severity,
      healthWorkerPhone,
      predictionData, // Contains AI prediction info
      verificationData, // Contains Gemini verification
      imageData, // Contains image and IPFS info
    } = body;

    // Validate required fields
    if (!patientName || !patientPhone || !diagnosis) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: patientName, patientPhone, diagnosis",
        },
        { status: 400 }
      );
    }

    console.log("✅ VALIDATION PASSED");

    // Find or create patient user
    console.log("🔍 SEARCHING FOR EXISTING USER...");
    let user = await prisma.user.findFirst({
      where: { phone: patientPhone },
    });

    if (!user) {
      console.log("➕ CREATING NEW USER...");
      user = await prisma.user.create({
        data: {
          name: patientName,
          phone: patientPhone,
          userType: "PATIENT",
          isVerified: false,
          email: `${patientPhone}@temp.medai.com`,
        },
      });
      console.log("✅ USER CREATED:", user.id);
    }

    // Find or create patient record
    let patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      console.log("➕ CREATING NEW PATIENT RECORD...");
      patient = await prisma.patient.create({
        data: {
          userId: user.id,
          age: patientAge ? parseInt(patientAge) : null,
          address: patientLocation,
        },
      });
    } // Find health worker (optional, can be null for AI-generated records)
    let healthWorker = null;
    let healthWorkerUser = null;
    if (healthWorkerPhone) {
      healthWorkerUser = await prisma.user.findFirst({
        where: { phone: healthWorkerPhone },
      });
      if (healthWorkerUser) {
        healthWorker = await prisma.healthWorker.findUnique({
          where: { userId: healthWorkerUser.id },
        });
      }
    } // Prepare medical record data
    const recordData = {
      patientId: patient.id,
      healthWorkerId: healthWorker?.id, // Use undefined if no health worker (MongoDB will handle this)
      diagnosis: diagnosis,
      symptoms: symptoms
        ? Array.isArray(symptoms)
          ? symptoms
          : [symptoms]
        : [],
      treatment: treatment || "Refer to dermatologist for treatment plan",
      medications: medications
        ? Array.isArray(medications)
          ? medications
          : [medications]
        : [],
      notes:
        notes ||
        `AI-assisted diagnosis with ${severity || "medium"} severity. ${
          verificationData ? "Verified by Gemini AI." : ""
        }`,
      attachments: imageData?.ipfs?.url ? [imageData.ipfs.url] : [],
      encrypted: false,
      cid: imageData?.ipfs?.hash || null,
      ipfsUrl: imageData?.ipfs?.url || null,
    };

    console.log("💾 CREATING MEDICAL RECORD...");

    // Create medical record
    const medicalRecord = await prisma.medicalRecord.create({
      data: recordData,
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
    });

    console.log("✅ MEDICAL RECORD CREATED:", medicalRecord.id); // Upload to blockchain for secure storage
    console.log("🔗 UPLOADING TO BLOCKCHAIN...");
    try {
      const blockchainData = {
        id: medicalRecord.id,
        patientId: patient.id,
        healthWorkerId: healthWorker?.id || "AI_SYSTEM",
        diagnosis: diagnosis,
        symptoms: symptoms
          ? Array.isArray(symptoms)
            ? symptoms
            : [symptoms]
          : [],
        treatment: treatment || "Refer to dermatologist for treatment plan",
        medications: medications
          ? Array.isArray(medications)
            ? medications
            : [medications]
          : [],
        notes: recordData.notes,
        createdAt: medicalRecord.createdAt.toISOString(),
        healthWorker: {
          name: healthWorkerUser?.name || "AI System",
          phone: healthWorkerUser?.phone || "system",
          specialization:
            healthWorker?.specialization || "AI-assisted diagnosis",
          hospital: healthWorker?.hospital || null,
        },
        patient: {
          name: user.name,
          phone: user.phone,
          age: patient.age,
        },
      };

      const blockchainResult = await uploadMedicalRecordToBlockchain(
        blockchainData
      );

      console.log("✅ BLOCKCHAIN UPLOAD SUCCESS:", blockchainResult.cid);

      // Update record with blockchain info
      await prisma.medicalRecord.update({
        where: { id: medicalRecord.id },
        data: {
          cid: blockchainResult.cid,
          ipfsUrl: blockchainResult.ipfsUrl,
        },
      });
    } catch (blockchainError) {
      console.error("⚠️ Blockchain upload failed:", blockchainError);
      // Continue without failing the whole request
    }

    return NextResponse.json({
      success: true,
      message: "Medical record created successfully",
      data: {
        recordId: medicalRecord.id,
        patientId: patient.id,
        patientName: user.name,
        diagnosis: diagnosis,
        createdAt: medicalRecord.createdAt,
        blockchainStored: medicalRecord.cid ? true : false,
        ipfsUrl: medicalRecord.ipfsUrl,
      },
    });
  } catch (error) {
    console.error("❌ Error creating medical record:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create medical record",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
