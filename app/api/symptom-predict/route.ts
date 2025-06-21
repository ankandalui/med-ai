import { NextRequest, NextResponse } from "next/server";

const SYMPTOM_API_URL = process.env.SYMPTOM_API_URL || "http://127.0.0.1:5001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptoms, language = "en" } = body;

    if (!symptoms || symptoms.trim() === "") {
      return NextResponse.json(
        { error: "Please enter symptoms" },
        { status: 400 }
      );
    } // Forward request to Symptom Prediction Flask API
    const response = await fetch(`${SYMPTOM_API_URL}/api/diagnose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symptoms: symptoms.trim(),
        language: language,
        force_english: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.error || "Failed to analyze symptoms",
          success: false,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      diagnosis: data.diagnosis,
      is_critical: data.is_critical,
      language: data.language,
      english_version: data.english_version,
      timestamp: data.timestamp || new Date().toISOString(),
      disclaimer:
        "This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare professional for proper diagnosis and treatment.",
    });
  } catch (error) {
    console.error("Symptom prediction error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to connect to symptom analysis service. Please ensure the symptom API server is running.",
        success: false,
      },
      { status: 500 }
    );
  }
}
