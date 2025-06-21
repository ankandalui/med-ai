const { PrismaClient } = require("@prisma/client");

async function debugHealthWorker() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Debugging health worker for phone: 7074757878");

    // Check if health worker user exists
    const healthWorkerUser = await prisma.user.findFirst({
      where: { phone: "7074757878" },
    });

    console.log(
      "👤 Health Worker User found:",
      healthWorkerUser ? "YES" : "NO"
    );
    if (healthWorkerUser) {
      console.log("   User ID:", healthWorkerUser.id);
      console.log("   User Name:", healthWorkerUser.name);
      console.log("   User Type:", healthWorkerUser.userType);
    }

    // Check if health worker profile exists
    const healthWorker = await prisma.healthWorker.findFirst({
      where: {
        user: {
          phone: "7074757878",
        },
      },
      include: {
        user: true,
      },
    });

    console.log("🏥 Health Worker Profile found:", healthWorker ? "YES" : "NO");
    if (healthWorker) {
      console.log("   Health Worker ID:", healthWorker.id);
      console.log("   License Number:", healthWorker.licenseNumber);
      console.log("   Specialization:", healthWorker.specialization);
    }

    // Check medical records created by this health worker
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        healthWorker: {
          user: {
            phone: "7074757878",
          },
        },
      },
    });

    console.log(
      "📋 Medical Records created by this health worker:",
      medicalRecords.length
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugHealthWorker();
