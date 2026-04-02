"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "./_actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-widest text-primary">CLIFFSIDE</h1>
          <p className="mt-1 text-sm text-muted">StoryLife — Système de gestion</p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-border bg-surface p-6 shadow-lg">
          <h2 className="mb-5 text-base font-semibold text-text">Connexion</h2>

          <form action={action} className="space-y-4">
            <div>
              <Label htmlFor="email" required>Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@cliffside.local"
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
                autoComplete="current-password"
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
              {isPending ? "Connexion en cours…" : "Se connecter"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-primary hover:underline">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
