const { PrismaClient } = require("@prisma/client");

async function debugPatientRecords() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Debugging patient records for phone: 7003714453");

    // 1. Check if user exists
    const user = await prisma.user.findFirst({
      where: { phone: "7003714453" },
    });

    console.log("👤 User found:", user ? "YES" : "NO");
    if (user) {
      console.log("   User ID:", user.id);
      console.log("   User Name:", user.name);
    }

    // 2. Check if patient exists
    const patient = await prisma.patient.findFirst({
      where: { user: { phone: "7003714453" } },
    });

    console.log("🏥 Patient found:", patient ? "YES" : "NO");
    if (patient) {
      console.log("   Patient ID:", patient.id);
    }

    // 3. Check medical records directly
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patient: {
          user: { phone: "7003714453" },
        },
      },
      include: {
        healthWorker: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log("📋 Medical Records found:", medicalRecords.length);
    medicalRecords.forEach((record, index) => {
      console.log(`   Record ${index + 1}:`);
      console.log(`     ID: ${record.id}`);
      console.log(`     Diagnosis: ${record.diagnosis}`);
      console.log(`     Symptoms: ${record.symptoms}`);
      console.log(`     Treatment: ${record.treatment}`);
      console.log(
        `     Health Worker: ${record.healthWorker?.user?.name || "N/A"}`
      );
      console.log(`     Created: ${record.createdAt}`);
    });

    // 4. Check monitoring records
    const monitoring = await prisma.patientMonitoring.findFirst({
      where: {
        patient: {
          user: { phone: "7003714453" },
        },
      },
    });

    console.log("📊 Monitoring found:", monitoring ? "YES" : "NO");
    if (monitoring) {
      console.log("   Monitoring ID:", monitoring.id);
      console.log("   Status:", monitoring.status);
      console.log(
        "   Symptoms:",
        monitoring.symptoms?.substring(0, 100) + "..."
      );
    }

    // 5. Check the full query that API uses
    const fullQuery = await prisma.user.findFirst({
      where: { phone: "7003714453" },
      include: {
        patient: {
          include: {
            records: {
              include: {
                healthWorker: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            monitoring: {
              include: {
                alerts: {
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
      },
    });

    console.log("🔍 Full API Query Result:");
    console.log("   User:", fullQuery ? "Found" : "Not found");
    console.log("   Patient:", fullQuery?.patient ? "Found" : "Not found");
    console.log(
      "   Medical Records:",
      fullQuery?.patient?.records?.length || 0
    );
    console.log(
      "   Monitoring:",
      fullQuery?.patient?.monitoring ? "Found" : "Not found"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPatientRecords();
