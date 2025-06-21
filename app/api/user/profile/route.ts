import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        patient:
          payload.userType === "PATIENT"
            ? {
                include: {
                  records: {
                    include: {
                      healthWorker: {
                        include: {
                          user: {
                            select: {
                              name: true,
                              email: true,
                            },
                          },
                        },
                      },
                    },
                    orderBy: {
                      createdAt: "desc",
                    },
                  },
                },
              }
            : false,
        healthWorker:
          payload.userType === "HEALTH_WORKER"
            ? {
                include: {
                  recordsCreated: {
                    include: {
                      patient: {
                        include: {
                          user: {
                            select: {
                              name: true,
                              email: true,
                            },
                          },
                        },
                      },
                    },
                    orderBy: {
                      createdAt: "desc",
                    },
                  },
                },
              }
            : false,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        userType: user.userType,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        ...(user.patient && { patient: user.patient }),
        ...(user.healthWorker && { healthWorker: user.healthWorker }),
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, ...profileData } = body;

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
    });

    // Update profile specific data
    if (payload.userType === "PATIENT" && profileData) {
      const {
        dateOfBirth,
        gender,
        bloodGroup,
        allergies,
        medicalHistory,
        emergencyContact,
        address,
      } = profileData;

      await prisma.patient.update({
        where: { userId: payload.userId },
        data: {
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(gender && { gender }),
          ...(bloodGroup && { bloodGroup }),
          ...(allergies && { allergies }),
          ...(medicalHistory && { medicalHistory }),
          ...(emergencyContact && { emergencyContact }),
          ...(address && { address }),
        },
      });
    } else if (payload.userType === "HEALTH_WORKER" && profileData) {
      const {
        specialization,
        experience,
        qualification,
        hospital,
        department,
        isActive,
      } = profileData;

      await prisma.healthWorker.update({
        where: { userId: payload.userId },
        data: {
          ...(specialization && { specialization }),
          ...(experience && { experience: parseInt(experience) }),
          ...(qualification && { qualification }),
          ...(hospital && { hospital }),
          ...(department && { department }),
          ...(typeof isActive !== "undefined" && { isActive }),
        },
      });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
