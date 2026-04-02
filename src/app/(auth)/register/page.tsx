"use client";

import { useActionState } from "react";
import { registerAction } from "./_actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-widest text-primary">CLIFFSIDE</h1>
          <p className="mt-1 text-sm text-muted">Création de compte</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-lg">
          <h2 className="mb-5 text-base font-semibold text-text">Inscription</h2>

          <form action={action} className="space-y-4">
            <div>
              <Label htmlFor="name" required>Pseudo (en jeu)</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="email" required>Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@exemple.fr"
                autoComplete="email"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="password" required>Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
              />
            </div>

            {state?.error && (
              <p role="alert" className="text-sm text-danger">
                {state.error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Inscription en cours…" : "S'inscrire"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
