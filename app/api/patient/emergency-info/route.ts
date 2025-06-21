import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Retrieve emergency info for a patient
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId") || "temp-patient-id";

    const emergencyInfo = await prisma.emergencyInfo.findUnique({
      where: { patientId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!emergencyInfo) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No emergency info found",
      });
    }

    return NextResponse.json({
      success: true,
      data: emergencyInfo,
      message: "Emergency info retrieved successfully",
    });
  } catch (error) {
    console.error("Get emergency info error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get emergency info",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create or update emergency info
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      bloodType,
      allergies,
      medications,
      conditions,
      emergencyContacts,
      doctorName,
      doctorPhone,
      hospital,
      insuranceInfo,
      organDonor,
    } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Upsert emergency info (create or update)
    const emergencyInfo = await prisma.emergencyInfo.upsert({
      where: { patientId },
      update: {
        bloodType: bloodType || null,
        allergies: allergies || [],
        medications: medications || [],
        conditions: conditions || [],
        emergencyContacts: emergencyContacts || [],
        doctorName: doctorName || null,
        doctorPhone: doctorPhone || null,
        hospital: hospital || null,
        insuranceInfo: insuranceInfo || null,
        organDonor: organDonor || false,
      },
      create: {
        patientId,
        bloodType: bloodType || null,
        allergies: allergies || [],
        medications: medications || [],
        conditions: conditions || [],
        emergencyContacts: emergencyContacts || [],
        doctorName: doctorName || null,
        doctorPhone: doctorPhone || null,
        hospital: hospital || null,
        insuranceInfo: insuranceInfo || null,
        organDonor: organDonor || false,
      },
    });

    return NextResponse.json({
      success: true,
      data: emergencyInfo,
      message: "Emergency info saved successfully",
    });
  } catch (error) {
    console.error("Save emergency info error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save emergency info",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
