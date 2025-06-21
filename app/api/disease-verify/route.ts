import { NextRequest, NextResponse } from "next/server";

const SYMPTOM_API_URL = "http://127.0.0.1:5001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prediction, confidence, image_url } = body;

    if (!prediction) {
      return NextResponse.json(
        { error: "Disease prediction is required", success: false },
        { status: 400 }
      );
    }

    console.log("🔍 Verifying disease prediction with Gemini AI:", prediction);

    // Create a comprehensive prompt for Gemini AI verification
    const verificationPrompt = `Act as a medical expert reviewing an AI skin disease prediction.

AI Prediction: ${prediction}
Confidence Level: ${confidence ? `${confidence.toFixed(1)}%` : "Not provided"}

Please provide a comprehensive medical assessment in EXACTLY this format:

[CONDITION VERIFICATION]
Assessment of the AI prediction accuracy and additional considerations

[SEVERITY LEVEL]
Low/Medium/High - with medical justification

[MEDICAL TREATMENT REQUIRED]
YES/NO - with clear reasoning

[PRIMARY CARE STEPS]
1. Immediate care recommendation
2. Home care instructions  
3. When to seek professional help

[TREATMENT RECOMMENDATIONS]
- Specific treatment options
- Medications (if applicable)
- Lifestyle modifications

[WHEN TO SEE A DOCTOR]
- Warning signs requiring immediate medical attention
- Follow-up recommendations

[HEALTH WORKER GUIDANCE]
Specific guidance for health workers on patient management

If this condition requires immediate medical attention, start with:
[URGENT] This condition requires immediate medical evaluation.

Keep the response professional and medically accurate.`; // Send request to Gemini AI via symptom API
    const response = await fetch(`${SYMPTOM_API_URL}/api/diagnose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symptoms: verificationPrompt,
        language: "en",
        force_english: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.error || "Failed to verify disease prediction",
          success: false,
        },
        { status: response.status }
      );
    }
    const data = await response.json();

    // Parse the Gemini response to extract key information
    const diagnosis = data.diagnosis || "";

    // Improved parsing for treatment requirement
    const requiresTreatment =
      diagnosis.includes("[URGENT]") ||
      diagnosis.includes("MEDICAL TREATMENT REQUIRED]\nYES") ||
      (diagnosis.toUpperCase().includes("YES") &&
        diagnosis.toUpperCase().includes("MEDICAL TREATMENT REQUIRED"));

    // Improved parsing for severity level
    const severityMatch = diagnosis.match(/\[SEVERITY LEVEL\]\s*([^[\n]+)/);
    const severity = severityMatch ? severityMatch[1].trim() : "Medium";

    console.log("✅ Disease verification completed:", {
      prediction,
      requiresTreatment,
      severity: severity.split("-")[0]?.trim() || "Medium",
    });

    return NextResponse.json({
      success: true,
      verified: true,
      original_prediction: prediction,
      original_confidence: confidence,
      gemini_analysis: diagnosis,
      medical_treatment_required: requiresTreatment,
      severity_level: severity.split("-")[0]?.trim() || "Medium",
      timestamp: new Date().toISOString(),
      disclaimer:
        "This AI-assisted analysis is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare professional for proper diagnosis and treatment.",
    });
  } catch (error) {
    console.error("Disease verification error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to verify disease prediction. Please ensure the symptom API server is running.",
        success: false,
      },
      { status: 500 }
    );
  }
}
