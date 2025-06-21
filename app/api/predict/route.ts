import { NextRequest, NextResponse } from "next/server";

const FLASK_API_URL = "https://disease-model-dxq9.onrender.com";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided", success: false },
        { status: 400 }
      );
    }

    // Create new FormData with the correct field name for Flask API
    const flaskFormData = new FormData();
    flaskFormData.append("file", image);

    console.log(`Connecting to Flask API at: ${FLASK_API_URL}/api/predict`);

    // Forward the request to Flask API
    const response = await fetch(`${FLASK_API_URL}/api/predict`, {
      method: "POST",
      body: flaskFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Flask API responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Flask API response received successfully"); // Transform Flask response to match expected frontend format
    const transformedResponse = {
      success: data.success,
      prediction_id: `pred_${Date.now()}`,
      prediction: data.prediction,
      confidence: data.confidence,
      treatment_info: {
        description: getTreatmentDescription(data.prediction),
        treatment: getTreatmentInfo(data.prediction),
        urgency: getUrgencyLevel(data.prediction),
        next_steps: getNextSteps(data.prediction),
      },
      timestamp: data.timestamp || new Date().toISOString(),
      storage_info: data.storage_info || null,
      storage_secure: data.storage_secure || false,
      disclaimer:
        "This AI analysis is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.",
      model_used: data.storage_secure ? "real_ai" : "demo_mode",
      database_id: data.storage_info?.image_id || `db_${Date.now()}`,
    };

    return NextResponse.json(transformedResponse, { status: 200 });
  } catch (error) {
    console.error("Error proxying to Flask API:", error);

    return NextResponse.json(
      {
        error: "Failed to connect to prediction service",
        success: false,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions to provide treatment information based on prediction
function getTreatmentDescription(prediction: string): string {
  const descriptions: { [key: string]: string } = {
    Eczema:
      "Eczema is a chronic inflammatory skin condition characterized by dry, itchy, and inflamed skin patches.",
    "Warts Molluscum and other Viral Infections":
      "Viral skin infections caused by various viruses, commonly affecting the outer layer of skin.",
    Melanoma:
      "A serious form of skin cancer that develops in melanocytes, the cells that produce melanin.",
    "Atopic Dermatitis":
      "A chronic inflammatory skin condition that causes dry, itchy, and inflamed skin.",
    "Basal Cell Carcinoma (BCC)":
      "The most common type of skin cancer, usually appearing as a flesh-colored or pink bump.",
    "Melanocytic Nevi (NV)":
      "Common moles that are usually benign growths of melanocytes.",
    "Benign Keratosis-like Lesions (BKL)":
      "Non-cancerous skin growths that appear as raised, waxy, or scaly patches.",
    "Psoriasis pictures Lichen Planus and related diseases":
      "Chronic autoimmune conditions causing red, scaly patches on the skin.",
    "Seborrheic Keratoses and other Benign Tumors":
      "Common, non-cancerous skin growths that appear as brown, black, or tan patches.",
    "Tinea Ringworm Candidiasis and other Fungal Infections":
      "Fungal infections of the skin, hair, or nails caused by various fungal organisms.",
  };
  return (
    descriptions[prediction] ||
    "A skin condition that requires professional medical evaluation."
  );
}

function getTreatmentInfo(prediction: string): string {
  const treatments: { [key: string]: string } = {
    Eczema:
      "Moisturizers, topical corticosteroids, antihistamines, and avoiding triggers. Severe cases may require immunosuppressants.",
    "Warts Molluscum and other Viral Infections":
      "Treatment may include topical medications, cryotherapy, or laser therapy. Some cases resolve on their own.",
    Melanoma:
      "Immediate surgical removal is typically required, followed by staging and potentially additional treatments like immunotherapy or chemotherapy.",
    "Atopic Dermatitis":
      "Regular moisturizing, topical corticosteroids, antihistamines, and identifying/avoiding triggers.",
    "Basal Cell Carcinoma (BCC)":
      "Surgical removal is the most common treatment. Options include excision, Mohs surgery, or radiation therapy.",
    "Melanocytic Nevi (NV)":
      "Usually no treatment needed unless showing signs of change. Regular monitoring is recommended.",
    "Benign Keratosis-like Lesions (BKL)":
      "Treatment is usually for cosmetic reasons and may include cryotherapy, electrosurgery, or laser treatment.",
    "Psoriasis pictures Lichen Planus and related diseases":
      "Topical corticosteroids, immunomodulators, phototherapy, and systemic medications for severe cases.",
    "Seborrheic Keratoses and other Benign Tumors":
      "Usually no treatment needed unless irritated. Can be removed for cosmetic reasons.",
    "Tinea Ringworm Candidiasis and other Fungal Infections":
      "Antifungal medications (topical or oral) depending on the type and severity of infection.",
  };
  return (
    treatments[prediction] ||
    "Consult with a dermatologist for appropriate treatment options."
  );
}

function getUrgencyLevel(prediction: string): "low" | "medium" | "high" {
  const urgencyMap: { [key: string]: "low" | "medium" | "high" } = {
    Melanoma: "high",
    "Basal Cell Carcinoma (BCC)": "high",
    "Psoriasis pictures Lichen Planus and related diseases": "medium",
    "Atopic Dermatitis": "medium",
    Eczema: "medium",
    "Warts Molluscum and other Viral Infections": "low",
    "Melanocytic Nevi (NV)": "low",
    "Benign Keratosis-like Lesions (BKL)": "low",
    "Seborrheic Keratoses and other Benign Tumors": "low",
    "Tinea Ringworm Candidiasis and other Fungal Infections": "medium",
  };
  return urgencyMap[prediction] || "medium";
}

function getNextSteps(prediction: string): string[] {
  const stepsMap: { [key: string]: string[] } = {
    Melanoma: [
      "Seek immediate medical attention from a dermatologist or oncologist",
      "Do not delay treatment - early intervention is crucial",
      "Prepare for potential biopsy and staging procedures",
      "Discuss treatment options with your healthcare team",
    ],
    "Basal Cell Carcinoma (BCC)": [
      "Schedule an appointment with a dermatologist within 1-2 weeks",
      "Avoid sun exposure and use broad-spectrum sunscreen",
      "Do not attempt to treat or remove the lesion yourself",
      "Prepare for potential biopsy and surgical removal",
    ],
    Eczema: [
      "Consult with a dermatologist for proper diagnosis",
      "Identify and avoid potential triggers",
      "Use gentle, fragrance-free moisturizers daily",
      "Consider allergy testing if symptoms are severe",
    ],
    "Atopic Dermatitis": [
      "Schedule an appointment with a dermatologist",
      "Keep a symptom diary to identify triggers",
      "Use mild, fragrance-free skin care products",
      "Avoid scratching and keep fingernails short",
    ],
    "Psoriasis pictures Lichen Planus and related diseases": [
      "Consult with a dermatologist for proper diagnosis",
      "Discuss treatment options including topical and systemic therapies",
      "Consider lifestyle modifications to reduce stress",
      "Join support groups for chronic skin conditions",
    ],
    "Tinea Ringworm Candidiasis and other Fungal Infections": [
      "See a healthcare provider for proper diagnosis",
      "Keep the affected area clean and dry",
      "Avoid sharing personal items like towels or clothing",
      "Complete the full course of antifungal treatment if prescribed",
    ],
  };

  return (
    stepsMap[prediction] || [
      "Schedule an appointment with a dermatologist",
      "Monitor the condition for any changes",
      "Take photos to track progression",
      "Avoid self-treatment without professional guidance",
    ]
  );
}

export async function GET() {
  try {
    console.log(`Health check to Flask API at: ${FLASK_API_URL}/api/health`);

    const response = await fetch(`${FLASK_API_URL}/api/health`);

    if (!response.ok) {
      throw new Error(
        `Flask API health check failed with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Flask API health check successful");

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Flask API health check failed:", error);
    return NextResponse.json(
      {
        error: "Flask API is not available",
        success: false,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
