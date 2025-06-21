import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, generateOTP } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Patient signup request body:", JSON.stringify(body, null, 2));
    const {
      email,
      phone,
      name,
      dateOfBirth,
      gender,
      age,
      address,
      aadharNumber,
      familyId,
    } = body;

    // Validate required fields
    if (!email || !phone || !name) {
      return NextResponse.json(
        { error: "Email, phone, and name are required" },
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
    }); // Create user and patient profile
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        name,
        userType: "PATIENT",
        patient: {
          create: {
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender || null,
            age: age ? parseInt(age.toString()) : null,
            address: address || null,
            aadharNumber: aadharNumber || null,
            familyId: familyId || null,
          },
        },
      },
      include: {
        patient: true,
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
      message: "Patient registered successfully",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        userType: user.userType,
        isVerified: user.isVerified,
        patient: user.patient,
      },
      token,
      otpSent: true,
      otpBypass: process.env.OTP_BYPASS_ENABLED === "true",
    });
  } catch (error) {
    console.error("Patient signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
