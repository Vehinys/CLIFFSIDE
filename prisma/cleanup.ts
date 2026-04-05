import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.deleteMany({
    where: { email: "admin@cliffside.local" },
  });
  console.log(`✅ Compte supprimé : ${u.count}`);

  const r = await prisma.role.deleteMany({
    where: { name: { in: ["Admin", "LEADER"] } },
  });
  console.log(`✅ Rôles supprimés : ${r.count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
