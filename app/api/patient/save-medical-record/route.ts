import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cid,
      title,
      description,
      type,
      tags,
      fileName,
      fileSize,
      fileType,
      ipfsUrl,
      patientId,
    } = body;
    if (!cid || !title || !type || !fileName || !fileSize || !fileType) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: cid, title, type, fileName, fileSize, fileType",
        },
        { status: 400 }
      );
    } // TODO: Get actual patient ID from authentication token
    // For now, get the first patient from the database
    let actualPatientId = patientId;

    if (!actualPatientId) {
      // Get the first patient as a fallback for testing
      const firstPatient = await prisma.patient.findFirst();
      if (firstPatient) {
        actualPatientId = firstPatient.id;
        console.log("Using first patient ID as fallback:", actualPatientId);
      } else {
        return NextResponse.json(
          {
            error: "No patient found. Please ensure a patient account exists.",
          },
          { status: 400 }
        );
      }
    }

    console.log("Saving medical record to database:", {
      cid,
      title,
      description,
      type,
      tags,
      fileName,
      fileSize,
      fileType,
      ipfsUrl,
      patientId: actualPatientId,
    });

    // Save to database using Prisma
    const savedRecord = await prisma.uploadedDocument.create({
      data: {
        patientId: actualPatientId,
        title,
        description: description || "",
        fileName,
        fileSize,
        fileType,
        type,
        tags: tags || [],
        cid,
        ipfsUrl: ipfsUrl || `https://gateway.lighthouse.storage/ipfs/${cid}`,
      },
    });

    console.log("Medical record saved successfully:", savedRecord.id);

    return NextResponse.json({
      success: true,
      recordId: savedRecord.id,
      message: "Medical record saved successfully",
    });
  } catch (error) {
    console.error("Save record error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save record",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
