const testData = {
  patientPhone: "7003714453",
  patientName: "Hack4bengal",
  patientAge: "50",
  patientLocation: "Kolkata",
  symptoms:
    "Testing blockchain medical record storage with chest pain symptoms",
  diagnosis: "Blockchain test - monitoring system integration",
  status: "attention",
  healthWorkerPhone: "7074757878",
};

async function testBlockchainMedicalRecord() {
  try {
    console.log("🧪 Testing blockchain medical record creation...");

    const response = await fetch(
      "http://localhost:3000/api/health-worker/monitoring",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    const result = await response.json();
    console.log("📋 API Response:", result);

    if (result.success) {
      console.log("✅ Medical record created successfully!");
      console.log("   Patient ID:", result.data?.patientMonitoring?.patientId);
      console.log("   Status:", result.data?.patientMonitoring?.status);

      // Now check if patient can see the record
      console.log("\n🔍 Checking if patient can see the blockchain record...");

      const patientResponse = await fetch(
        `http://localhost:3000/api/patient/records?phone=${testData.patientPhone}`
      );
      const patientResult = await patientResponse.json();

      if (patientResult.success) {
        console.log(
          "📋 Patient records found:",
          patientResult.data.medicalRecords.length
        );

        patientResult.data.medicalRecords.forEach((record, index) => {
          console.log(`\n📋 Record ${index + 1}:`);
          console.log(`   ID: ${record.id}`);
          console.log(`   Diagnosis: ${record.diagnosis}`);
          console.log(`   Encrypted: ${record.encrypted}`);
          console.log(`   CID: ${record.cid || "Not set"}`);
          console.log(`   IPFS URL: ${record.ipfsUrl || "Not set"}`);
          console.log(`   Created: ${record.createdAt}`);
        });
      } else {
        console.log("❌ Failed to fetch patient records:", patientResult.error);
      }
    } else {
      console.log("❌ Failed to create medical record:", result.error);
    }
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

testBlockchainMedicalRecord();
