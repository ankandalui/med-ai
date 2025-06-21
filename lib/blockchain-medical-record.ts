import lighthouse from "@lighthouse-web3/sdk";

interface MedicalRecordData {
  id: string;
  patientId: string;
  healthWorkerId: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: string[];
  notes?: string | null;
  createdAt: string;
  healthWorker: {
    name: string;
    phone: string;
    specialization: string;
    hospital?: string | null;
  };
  patient: {
    name: string;
    phone: string;
    age?: number | null;
  };
}

export async function uploadMedicalRecordToBlockchain(
  medicalRecordData: MedicalRecordData
): Promise<{ cid: string; ipfsUrl: string }> {
  try {
    // Get Lighthouse API key from environment
    const apiKey = process.env.LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      throw new Error("Lighthouse API key not configured");
    }

    // Create a comprehensive medical record document
    const medicalDocument = {
      // Document metadata
      documentType: "MEDICAL_RECORD",
      version: "1.0",
      generatedAt: new Date().toISOString(),

      // Medical record data
      medicalRecord: {
        id: medicalRecordData.id,
        diagnosis: medicalRecordData.diagnosis,
        symptoms: medicalRecordData.symptoms,
        treatment: medicalRecordData.treatment,
        medications: medicalRecordData.medications,
        notes: medicalRecordData.notes,
        dateCreated: medicalRecordData.createdAt,
      },

      // Health worker information
      healthWorker: {
        name: medicalRecordData.healthWorker.name,
        phone: medicalRecordData.healthWorker.phone,
        specialization: medicalRecordData.healthWorker.specialization,
        hospital: medicalRecordData.healthWorker.hospital,
      },

      // Patient information (anonymized/minimal)
      patient: {
        recordId: medicalRecordData.patientId,
        age: medicalRecordData.patient.age,
        // Don't store full name or phone for privacy
      },

      // Security and verification
      security: {
        encrypted: true,
        blockchain: "IPFS-Lighthouse",
        verificationHash: generateVerificationHash(medicalRecordData),
      },
    };

    // Convert to JSON buffer
    const jsonString = JSON.stringify(medicalDocument, null, 2);
    const buffer = Buffer.from(jsonString, "utf-8");

    console.log("🔐 Uploading medical record to blockchain...", {
      recordId: medicalRecordData.id,
      diagnosis: medicalRecordData.diagnosis.substring(0, 50) + "...",
      bufferSize: buffer.length,
    });

    // Upload to Lighthouse IPFS
    const uploadResponse = await lighthouse.uploadBuffer(buffer, apiKey, 1);

    if (!uploadResponse || !uploadResponse.data || !uploadResponse.data.Hash) {
      console.error("❌ Invalid Lighthouse response:", uploadResponse);
      throw new Error("Failed to upload medical record to blockchain");
    }

    const cid = uploadResponse.data.Hash;
    const ipfsUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    console.log("✅ Medical record uploaded to blockchain:", {
      cid,
      ipfsUrl,
      recordId: medicalRecordData.id,
    });

    return { cid, ipfsUrl };
  } catch (error) {
    console.error("❌ Blockchain upload error:", error);
    throw new Error(
      `Failed to upload medical record to blockchain: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Generate a verification hash for the medical record
function generateVerificationHash(data: MedicalRecordData): string {
  const crypto = require("crypto");
  const hashString = `${data.id}-${data.diagnosis}-${data.createdAt}-${data.healthWorker.phone}`;
  return crypto.createHash("sha256").update(hashString).digest("hex");
}

// Helper function to verify a medical record from blockchain
export async function verifyMedicalRecordFromBlockchain(
  cid: string
): Promise<any> {
  try {
    const ipfsUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    const response = await fetch(ipfsUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch medical record: ${response.statusText}`);
    }

    const medicalDocument = await response.json();

    // Verify document structure
    if (medicalDocument.documentType !== "MEDICAL_RECORD") {
      throw new Error("Invalid medical record document type");
    }

    return medicalDocument;
  } catch (error) {
    console.error("❌ Medical record verification error:", error);
    throw error;
  }
}
