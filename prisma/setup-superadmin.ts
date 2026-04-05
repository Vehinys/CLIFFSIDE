import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SUPERADMIN_EMAIL = "albert.lecomte1989@gmail.com";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: SUPERADMIN_EMAIL },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    console.error(`❌ Compte introuvable : ${SUPERADMIN_EMAIL}`);
    console.error("   Inscris-toi d'abord sur l'application.");
    process.exit(1);
  }

  await prisma.user.update({
    where: { email: SUPERADMIN_EMAIL },
    data: { isSuperAdmin: true },
  });

  // Supprimer le compte admin par défaut s'il existe encore
  await prisma.user.deleteMany({
    where: { email: "admin@cliffside.local" },
  });

  console.log(`✅ Superadmin activé : ${user.name ?? user.email}`);
  console.log("   Reconnecte-toi pour que les permissions soient rechargées.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
