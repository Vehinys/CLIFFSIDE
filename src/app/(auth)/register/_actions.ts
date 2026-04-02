"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(1, "Pseudo/Nom requis"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

export async function registerAction(_prevState: { error: string } | undefined, formData: FormData) {
  let isSuccess = false;
  
  try {
    const rawData = Object.fromEntries(formData);
    const result = registerSchema.safeParse(rawData);

    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Erreur de validation" };
    }

    const { email, name, password } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Cet email est déjà utilisé" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    isSuccess = true;
  } catch (error) {
    console.error("Erreur inscription:", error);
    return { error: "Une erreur s'est produite lors de l'inscription." };
  }

  if (isSuccess) {
    redirect("/login");
  }
}
