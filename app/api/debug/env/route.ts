import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;

    return NextResponse.json({
      hasDbUrl: !!dbUrl,
      dbUrlLength: dbUrl?.length || 0,
      dbUrlPreview: dbUrl
        ? `${dbUrl.substring(0, 20)}...${dbUrl.substring(dbUrl.length - 20)}`
        : "N/A",
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check env" }, { status: 500 });
  }
}
