import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Retrieve all uploaded documents for a patient
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const type = searchParams.get("type"); // optional filter by type
    const limit = searchParams.get("limit"); // optional limit
    const search = searchParams.get("search"); // optional search query

    let whereClause: any = {};

    // If patientId is provided, filter by it, otherwise get all documents (for testing)
    if (patientId) {
      whereClause.patientId = patientId;
    }

    if (type && type !== "all") {
      whereClause.type = type;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    console.log("Fetching documents with where clause:", whereClause);

    const documents = await prisma.uploadedDocument.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      ...(limit && { take: parseInt(limit) }),
    });

    console.log(`Found ${documents.length} documents in database`);

    // Transform for frontend compatibility
    const transformedDocuments = documents.map((doc) => ({
      id: doc.id,
      type: doc.type,
      title: doc.title,
      description: doc.description,
      date: doc.createdAt.toISOString().split("T")[0],
      size: `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`,
      encrypted: true, // All Lighthouse files are encrypted
      ipfsHash: doc.cid,
      lighthouse_cid: doc.cid,
      uploadedBy: "Patient", // TODO: Get actual user info from patientId
      tags: doc.tags,
      isShared: false, // Default to not shared
      fileName: doc.fileName,
      fileType: doc.fileType,
      ipfsUrl: doc.ipfsUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
    console.log(
      `Returning ${transformedDocuments.length} transformed documents`
    );

    return NextResponse.json({
      success: true,
      data: transformedDocuments,
      documents: transformedDocuments, // For backward compatibility
      count: transformedDocuments.length,
      message: "Documents retrieved successfully",
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get documents",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    console.log("Deleting document with ID:", id);

    const document = await prisma.uploadedDocument.delete({
      where: { id },
    });

    console.log("Document deleted successfully:", document.title);

    return NextResponse.json({
      success: true,
      data: document,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete document",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
