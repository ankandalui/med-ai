const { PrismaClient } = require("@prisma/client");

async function debugMedicalRecords() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Debugging all medical records by health worker 7074757878");

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        healthWorker: {
          user: {
            phone: "7074757878",
          },
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        healthWorker: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log("📋 Found", medicalRecords.length, "medical records:");

    medicalRecords.forEach((record, index) => {
      console.log(`\n📋 Record ${index + 1}:`);
      console.log(`   Record ID: ${record.id}`);
      console.log(`   Patient Phone: ${record.patient?.user?.phone || "N/A"}`);
      console.log(`   Patient Name: ${record.patient?.user?.name || "N/A"}`);
      console.log(`   Diagnosis: ${record.diagnosis}`);
      console.log(`   Symptoms: ${JSON.stringify(record.symptoms)}`);
      console.log(`   Treatment: ${record.treatment}`);
      console.log(`   Created: ${record.createdAt}`);
    });

    // Specifically check for patient 7003714453
    console.log("\n🔍 Checking specifically for patient 7003714453:");

    const patientRecords = await prisma.medicalRecord.findMany({
      where: {
        patient: {
          user: {
            phone: "7003714453",
          },
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        healthWorker: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log("📋 Records for patient 7003714453:", patientRecords.length);

    patientRecords.forEach((record, index) => {
      console.log(`\n📋 Patient Record ${index + 1}:`);
      console.log(`   Record ID: ${record.id}`);
      console.log(
        `   Health Worker: ${record.healthWorker?.user?.name || "N/A"}`
      );
      console.log(
        `   Health Worker Phone: ${record.healthWorker?.user?.phone || "N/A"}`
      );
      console.log(`   Diagnosis: ${record.diagnosis}`);
      console.log(`   Created: ${record.createdAt}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMedicalRecords();
