import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🗑️  Nettoyage de la base de données...");

  // Ordre de suppression : enfants avant parents (clés étrangères)
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.dailyAttendance.deleteMany();
  await prisma.dailyObjective.deleteMany();
  await prisma.treasuryTransaction.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.meetingReport.deleteMany();
  await prisma.sharedNote.deleteMany();
  await prisma.secretariatTask.deleteMany();
  await prisma.user.deleteMany();
  await prisma.inventoryCategory.deleteMany();
  await prisma.dailySession.deleteMany();
  await prisma.role.deleteMany();

  console.log("✅ Base vidée — schéma conservé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
