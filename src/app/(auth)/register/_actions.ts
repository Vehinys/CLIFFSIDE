"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(1, "Pseudo/Nom requis"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
});

export async function registerAction(_prevState: { error: string } | undefined, formData: FormData) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";

  if (!checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000)) {
    return { error: "Trop de tentatives. Réessayez dans 1 heure." };
  }

  let isSuccess = false;

  try {
    const result = registerSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Erreur de validation" };
    }

    const { email, name, password } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Cet email est déjà utilisé" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, name, password: hashedPassword } });
    isSuccess = true;
  } catch {
    return { error: "Une erreur s'est produite lors de l'inscription." };
  }

  if (isSuccess) redirect("/login");
}
