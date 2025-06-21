const { PrismaClient } = require("@prisma/client");

async function debugMonitoringRecord() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Debugging monitoring record for patient 7003714453");

    const monitoring = await prisma.patientMonitoring.findFirst({
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
      },
    });

    if (monitoring) {
      console.log("📊 Monitoring Record Details:");
      console.log("   ID:", monitoring.id);
      console.log("   Patient ID:", monitoring.patientId);
      console.log("   Patient Name:", monitoring.patient?.user?.name);
      console.log("   Patient Phone:", monitoring.patient?.user?.phone);
      console.log("   Status:", monitoring.status);
      console.log("   Symptoms:", monitoring.symptoms);
      console.log("   Diagnosis:", monitoring.diagnosis);
      console.log("   Emergency ID:", monitoring.emergencyId);
      console.log("   Health Worker Phone:", monitoring.healthWorkerPhone);
      console.log("   Created:", monitoring.createdAt);
      console.log("   Updated:", monitoring.updatedAt);
    } else {
      console.log("❌ No monitoring record found");
    }

    // Check if medical record should exist but doesn't
    console.log("\n🔍 Checking if medical record should have been created...");

    if (monitoring) {
      // Try to create the missing medical record manually
      console.log("📝 Attempting to create missing medical record...");

      const healthWorker = await prisma.healthWorker.findFirst({
        where: {
          user: {
            phone: monitoring.healthWorkerPhone || "7074757878",
          },
        },
      });

      if (healthWorker && monitoring.patient) {
        try {
          const medicalRecord = await prisma.medicalRecord.create({
            data: {
              patientId: monitoring.patient.id,
              healthWorkerId: healthWorker.id,
              diagnosis: monitoring.diagnosis || "Monitoring record",
              symptoms: [monitoring.symptoms || "No symptoms recorded"],
              treatment:
                monitoring.status === "critical"
                  ? "Emergency treatment initiated. Patient referred to hospital."
                  : "Patient under observation and monitoring.",
              medications: [],
              notes: monitoring.emergencyId
                ? `Emergency case ${monitoring.emergencyId}. Auto-generated from symptom prediction system.`
                : "Patient added to monitoring system.",
              attachments: [],
            },
          });

          console.log("✅ Medical record created successfully!");
          console.log("   Record ID:", medicalRecord.id);
          console.log("   Patient ID:", medicalRecord.patientId);
          console.log("   Health Worker ID:", medicalRecord.healthWorkerId);
        } catch (error) {
          console.error("❌ Error creating medical record:", error);
        }
      } else {
        console.log(
          "❌ Missing health worker or patient for medical record creation"
        );
        console.log("   Health Worker found:", healthWorker ? "YES" : "NO");
        console.log("   Patient found:", monitoring.patient ? "YES" : "NO");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMonitoringRecord();
