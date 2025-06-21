import { NextRequest, NextResponse } from "next/server";
import lighthouse from "@lighthouse-web3/sdk";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const metadata = formData.get("metadata") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get Lighthouse API key from environment
    const apiKey = process.env.LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      throw new Error("Lighthouse API key not configured");
    }

    // Convert File to Buffer for Lighthouse upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse metadata if provided
    let parsedMetadata = null;
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (error) {
        console.warn("Failed to parse metadata:", error);
      }
    }

    console.log("🔗 Starting Lighthouse upload...", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      bufferSize: buffer.length,
      metadata: parsedMetadata,
    });
    console.log("🔑 API key configured:", !!apiKey);

    // Upload file to Lighthouse IPFS using uploadBuffer method
    console.log("📡 Using lighthouse.uploadBuffer method...");

    // Use cidVersion 1 for compatibility (default)
    const uploadResponse = await lighthouse.uploadBuffer(buffer, apiKey, 1);

    console.log("📡 Lighthouse response:", uploadResponse);

    if (!uploadResponse || !uploadResponse.data || !uploadResponse.data.Hash) {
      console.error("❌ Invalid Lighthouse response:", uploadResponse);
      throw new Error("Failed to upload file to Lighthouse");
    }

    const cid = uploadResponse.data.Hash;

    console.log("✅ File uploaded successfully to Lighthouse:", {
      cid,
      fileName: file.name,
      lighthouseUrl: `https://gateway.lighthouse.storage/ipfs/${cid}`,
    });

    return NextResponse.json({
      success: true,
      cid,
      ipfsUrl: `https://gateway.lighthouse.storage/ipfs/${cid}`,
      message: "File uploaded successfully to Lighthouse IPFS",
    });
  } catch (error) {
    console.error("❌ Lighthouse upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
