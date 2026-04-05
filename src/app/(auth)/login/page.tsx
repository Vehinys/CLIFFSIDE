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
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 overflow-hidden">
      {/* Fond décoratif */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-primary/3 blur-2xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl border border-primary/30 bg-primary/10">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#dc2626" strokeWidth="1.5" aria-hidden="true">
              <path d="M11 2L3 7v8l8 5 8-5V7L11 2z" />
              <path d="M3 7l8 5 8-5" />
              <line x1="11" y1="12" x2="11" y2="20" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-primary">CLIFFSIDE</h1>
          <p className="mt-1 text-sm text-muted">StoryLife — Système de gestion</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-2xl shadow-black/50">
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
            <Link href="/register" className="text-primary hover:underline transition-opacity hover:opacity-80">
              S&apos;inscrire
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted/40">
          Organisation CLIFFSIDE · Accès restreint
        </p>
      </div>
    </div>
  );
}
