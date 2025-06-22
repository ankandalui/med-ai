import { NextRequest, NextResponse } from "next/server";

// Helper: Call Gemini Vision API
async function checkImageWithGemini(imageBuffer: Buffer, apiKey: string) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`;
  const base64Image = imageBuffer.toString("base64");
  const prompt = {
    contents: [
      {
        parts: [
          {
            text: "Does this image contain a group of people or is it a close-up of a single person's skin? Reply ONLY with one of these: 'group', 'single skin', or 'other'. If group or other, do not allow for skin disease prediction.",
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
  };
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prompt),
  });
  if (!res.ok) throw new Error("Gemini API error");
  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || "";
  if (text.includes("group")) return { containsGroup: true };
  if (text.includes("single skin")) return { containsGroup: false };
  return { containsGroup: true, error: "Image is not a valid skin image." };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return NextResponse.json(
        { success: false, error: "Gemini API key missing" },
        { status: 500 }
      );
    const formData = await req.formData();
    const file = formData.get("image");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No image uploaded" },
        { status: 400 }
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await checkImageWithGemini(buffer, apiKey);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gemini check failed" },
      { status: 500 }
    );
  }
}
