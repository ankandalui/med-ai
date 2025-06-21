import { NextRequest, NextResponse } from "next/server";

const SYMPTOM_API_URL = process.env.SYMPTOM_API_URL || "http://127.0.0.1:5001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, lang = "en" } = body;

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Forward request to Symptom API for text-to-speech
    const response = await fetch(`${SYMPTOM_API_URL}/api/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.trim(),
        lang: lang,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.error || "Failed to generate audio",
          success: false,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      audio: data.audio,
      timestamp: data.timestamp || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to text-to-speech service.",
        success: false,
      },
      { status: 500 }
    );
  }
}
