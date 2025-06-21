import { NextRequest, NextResponse } from "next/server";

// Use IPv4 localhost to avoid IPv6 connection issues
const FLASK_API_URL = "http://127.0.0.1:5000";

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
    console.log("Flask API response received successfully");

    // Check if Flask API returned real model predictions
    if (!data.success || data.error) {
      // Return error directly from Flask API - no mock data
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Model not available",
          message: data.message || "The AI model is not currently loaded",
        },
        { status: 500 }
      );
    } // Only return the raw AI prediction data from Flask - no medical enhancements
    const apiResponse = {
      ...data, // Keep all real Flask API data only
      prediction_id: `prediction_${Date.now()}`,
      disclaimer:
        "This AI analysis is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.",
      database_id: data.storage_info?.image_id || null,
      ipfs: data.storage_info
        ? {
            hash: data.storage_info.lighthouse_hash,
            url: data.storage_info.gateway_url,
            lighthouse_url: data.storage_info.gateway_url,
          }
        : null,
    };

    return NextResponse.json(apiResponse, { status: 200 });
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
