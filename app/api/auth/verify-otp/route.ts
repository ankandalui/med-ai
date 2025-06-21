import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isOTPValid } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, otp } = body;

    if (!otp || (!email && !phone)) {
      return NextResponse.json(
        { error: "OTP and either email or phone are required" },
        { status: 400 }
      );
    }

    // Find the OTP verification record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        OR: [{ email: email }, { phone: phone }],
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP not found or expired" },
        { status: 404 }
      );
    }

    // Verify OTP
    if (!isOTPValid(otp, otpRecord.otp)) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Mark OTP as verified
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Mark user as verified
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: otpRecord.email || "" },
          { phone: otpRecord.phone || "" },
        ],
      },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    return NextResponse.json({
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
