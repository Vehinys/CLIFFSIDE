import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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
