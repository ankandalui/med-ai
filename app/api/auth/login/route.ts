import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
      },
      include: {
        patient: true,
        healthWorker: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    } // Check if OTP bypass is enabled
    const otpBypassEnabled = process.env.OTP_BYPASS_ENABLED === "true";

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    if (otpBypassEnabled) {
      // Mark user as verified if OTP bypass is enabled
      if (!user.isVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true },
        });
      }

      return NextResponse.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          userType: user.userType,
          isVerified: true,
          ...(user.patient && { patient: user.patient }),
          ...(user.healthWorker && { healthWorker: user.healthWorker }),
        },
        token,
        otpBypass: true,
      });
    } else {
      // Create OTP verification record for normal flow
      const { generateOTP } = await import("@/lib/auth");
      const otp = generateOTP();

      await prisma.oTPVerification.create({
        data: {
          email: user.email,
          phone: user.phone,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      return NextResponse.json({
        message: "OTP sent successfully",
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          userType: user.userType,
          isVerified: user.isVerified,
          ...(user.patient && { patient: user.patient }),
          ...(user.healthWorker && { healthWorker: user.healthWorker }),
        },
        token,
        otpBypass: false,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
