"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

export async function loginAction(_prev: { error: string } | undefined, formData: FormData) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";

  if (!checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou mot de passe incorrect." };
    }
    throw error;
  }
}
