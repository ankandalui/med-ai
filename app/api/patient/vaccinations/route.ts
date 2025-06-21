import { NextRequest, NextResponse } from "next/server";

// GET - Retrieve vaccination records (mock data for demo)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId") || "temp-patient-id";
    const category = searchParams.get("category"); // optional filter

    // Mock vaccination data for demo
    const mockVaccinations = [
      {
        id: "1",
        vaccineName: "COVID-19 (Pfizer)",
        manufacturer: "Pfizer-BioNTech",
        batchNumber: "FH3923",
        dateAdministered: "2024-01-15",
        location: "City Health Center",
        administrator: "Dr. Sarah Johnson",
        doseNumber: 3,
        totalDoses: 3,
        nextDueDate: "2025-01-15",
        certificateUrl: "https://gateway.lighthouse.storage/ipfs/QmVaccine1",
        verified: true,
        notes: "Booster dose administered. No adverse reactions.",
        category: "covid",
      },
      {
        id: "2",
        vaccineName: "Influenza (Flu Shot)",
        manufacturer: "Sanofi Pasteur",
        batchNumber: "FL9887",
        dateAdministered: "2024-10-01",
        location: "Local Pharmacy",
        administrator: "Pharmacist Mike Chen",
        doseNumber: 1,
        totalDoses: 1,
        nextDueDate: "2025-10-01",
        certificateUrl: "https://gateway.lighthouse.storage/ipfs/QmVaccine2",
        verified: true,
        notes: "Annual flu vaccination.",
        category: "routine",
      },
      {
        id: "3",
        vaccineName: "Hepatitis B",
        manufacturer: "GlaxoSmithKline",
        batchNumber: "HB4521",
        dateAdministered: "2023-06-15",
        location: "Travel Clinic",
        administrator: "Dr. Priya Patel",
        doseNumber: 3,
        totalDoses: 3,
        certificateUrl: "https://gateway.lighthouse.storage/ipfs/QmVaccine3",
        verified: true,
        notes:
          "Final dose of Hepatitis B series. Travel vaccination completed.",
        category: "travel",
      },
      {
        id: "4",
        vaccineName: "Tetanus-Diphtheria (Td)",
        manufacturer: "Sanofi Pasteur",
        batchNumber: "TD7734",
        dateAdministered: "2022-03-20",
        location: "Emergency Department",
        administrator: "Nurse Jennifer Lopez",
        doseNumber: 1,
        totalDoses: 1,
        nextDueDate: "2032-03-20",
        certificateUrl: "https://gateway.lighthouse.storage/ipfs/QmVaccine4",
        verified: true,
        notes: "Emergency tetanus shot after minor injury.",
        category: "emergency",
      },
    ];

    // Filter by category if specified
    let filteredVaccinations = mockVaccinations;
    if (category && category !== "all") {
      filteredVaccinations = mockVaccinations.filter(
        (v) => v.category === category
      );
    }

    // Sort by date (newest first)
    filteredVaccinations.sort(
      (a, b) =>
        new Date(b.dateAdministered).getTime() -
        new Date(a.dateAdministered).getTime()
    );

    const stats = {
      total: mockVaccinations.length,
      verified: mockVaccinations.filter((v) => v.verified).length,
      pending: mockVaccinations.filter((v) => !v.verified).length,
      categories: {
        covid: mockVaccinations.filter((v) => v.category === "covid").length,
        routine: mockVaccinations.filter((v) => v.category === "routine")
          .length,
        travel: mockVaccinations.filter((v) => v.category === "travel").length,
        emergency: mockVaccinations.filter((v) => v.category === "emergency")
          .length,
        other: mockVaccinations.filter((v) => v.category === "other").length,
      },
    };

    return NextResponse.json({
      success: true,
      data: filteredVaccinations,
      stats,
      message: "Vaccination records retrieved successfully",
    });
  } catch (error) {
    console.error("Get vaccination records error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get vaccination records",
      },
      { status: 500 }
    );
  }
}

// POST - Add new vaccination record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      vaccineName,
      manufacturer,
      batchNumber,
      dateAdministered,
      location,
      administrator,
      doseNumber,
      totalDoses,
      nextDueDate,
      notes,
      category,
    } = body;

    if (!patientId || !vaccineName || !dateAdministered) {
      return NextResponse.json(
        {
          error: "Patient ID, vaccine name, and date administered are required",
        },
        { status: 400 }
      );
    }

    // Mock creation - in real implementation, save to database
    const newVaccination = {
      id: `new_${Date.now()}`,
      vaccineName,
      manufacturer: manufacturer || "",
      batchNumber: batchNumber || "",
      dateAdministered,
      location: location || "",
      administrator: administrator || "",
      doseNumber: doseNumber || 1,
      totalDoses: totalDoses || 1,
      nextDueDate: nextDueDate || null,
      certificateUrl: null,
      verified: false,
      notes: notes || "",
      category: category || "other",
    };

    return NextResponse.json({
      success: true,
      data: newVaccination,
      message: "Vaccination record created successfully",
    });
  } catch (error) {
    console.error("Create vaccination record error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create vaccination record",
      },
      { status: 500 }
    );
  }
}

// PUT - Update vaccination record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Vaccination record ID is required" },
        { status: 400 }
      );
    }

    // Mock update - in real implementation, update in database
    return NextResponse.json({
      success: true,
      data: { id, ...updateData },
      message: "Vaccination record updated successfully",
    });
  } catch (error) {
    console.error("Update vaccination record error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update vaccination record",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete vaccination record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Vaccination record ID is required" },
        { status: 400 }
      );
    }

    // Mock deletion - in real implementation, delete from database
    return NextResponse.json({
      success: true,
      message: "Vaccination record deleted successfully",
    });
  } catch (error) {
    console.error("Delete vaccination record error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete vaccination record",
      },
      { status: 500 }
    );
  }
}
