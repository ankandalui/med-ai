import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, generateOTP } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(
      "Health worker signup request body:",
      JSON.stringify(body, null, 2)
    );
    const {
      email,
      phone,
      name,
      licenseNumber,
      specialization,
      areaVillage,
      hospital,
      aadharNumber,
    } = body; // Validate required fields
    if (!email || !phone || !name || !licenseNumber || !specialization) {
      return NextResponse.json(
        {
          error:
            "Email, phone, name, license number, and specialization are required",
        },
        { status: 400 }
      );
    } // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { phone: phone }],
      },
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "phone";
      return NextResponse.json(
        {
          error: `A user already exists with this ${conflictField}. Please try logging in instead.`,
          conflictField,
        },
        { status: 409 }
      );
    }

    // Check if license number already exists
    const existingHealthWorker = await prisma.healthWorker.findUnique({
      where: { licenseNumber },
    });

    if (existingHealthWorker) {
      return NextResponse.json(
        { error: "Health worker with this license number already exists" },
        { status: 409 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await prisma.oTPVerification.create({
      data: {
        email,
        phone,
        otp,
        expiresAt: otpExpiresAt,
      },
    }); // Create user and health worker profile
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        name,
        userType: "HEALTH_WORKER",
        healthWorker: {
          create: {
            licenseNumber,
            specialization,
            hospital: hospital || null,
            areaVillage: areaVillage || null,
            aadharNumber: aadharNumber || null,
          },
        },
      },
      include: {
        healthWorker: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    // In bypass mode, automatically verify the user
    if (process.env.OTP_BYPASS_ENABLED === "true") {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });

      await prisma.oTPVerification.updateMany({
        where: { email },
        data: { verified: true },
      });
    }

    return NextResponse.json({
      message: "Health worker registered successfully",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        userType: user.userType,
        isVerified: user.isVerified,
        healthWorker: user.healthWorker,
      },
      token,
      otpSent: true,
      otpBypass: process.env.OTP_BYPASS_ENABLED === "true",
    });
  } catch (error) {
    console.error("Health worker signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
