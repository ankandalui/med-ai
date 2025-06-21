import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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
        healthWorker: record.healthWorker.user.name,
        healthWorkerPhone: record.healthWorker.user.phone,
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
