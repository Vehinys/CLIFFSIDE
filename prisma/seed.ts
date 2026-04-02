import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding CLIFFSIDE...");

  // 1. Rôle ADMIN système (non supprimable)
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      color: "#ef4444",
      description: "Accès total — rôle système",
      isSystem: true,
      permissions: {
        create: [
          { resource: "dashboard", action: "read" },
          { resource: "members",   action: "read" },
          { resource: "members",   action: "create" },
          { resource: "members",   action: "update" },
          { resource: "members",   action: "delete" },
          { resource: "inventory", action: "read" },
          { resource: "inventory", action: "create" },
          { resource: "inventory", action: "update" },
          { resource: "inventory", action: "delete" },
          { resource: "treasury",  action: "read" },
          { resource: "treasury",  action: "create" },
          { resource: "treasury",  action: "update" },
          { resource: "treasury",  action: "delete" },
          { resource: "roles",     action: "read" },
          { resource: "roles",     action: "create" },
          { resource: "roles",     action: "update" },
          { resource: "roles",     action: "delete" },
        ],
      },
    },
    include: { permissions: true },
  });

  // 2. Rôle Membre (lecture seule par défaut)
  await prisma.role.upsert({
    where: { name: "Membre" },
    update: {},
    create: {
      name: "Membre",
      color: "#3b82f6",
      description: "Membre de l'organisation",
      isSystem: false,
      permissions: {
        create: [
          { resource: "dashboard", action: "read" },
          { resource: "inventory", action: "read" },
        ],
      },
    },
  });

  // 3. Utilisateur admin par défaut
  const hashedPassword = await bcrypt.hash("Admin1234!", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@cliffside.local" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@cliffside.local",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("✅ Seed terminé");
  console.log(`   Rôle Admin : ${adminRole.id}`);
  console.log(`   User admin : ${adminUser.email} / Admin1234!`);
  console.log("   ⚠️  Change le mot de passe après la première connexion !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
