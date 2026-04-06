"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "./_actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "@/components/ui/particles-background";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg sm:px-6 lg:px-8">
      {/* Dynamic Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Glows */}
        <div className="absolute -top-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-primary/10 blur-[120px] animate-pulse [animation-duration:10s]" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px] animate-pulse [animation-duration:8s] [animation-delay:2s]" />
        
        {/* Abstract Grid Pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        
        {/* Particles */}
        <ParticlesBackground />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Branding */}
        <div className="mb-10 flex flex-col items-center">
          <div className="group relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-surface to-bg border border-white/10 shadow-[0_0_40px_rgba(220,38,38,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(220,38,38,0.4)] hover:border-primary/50">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            <svg className="relative z-10 text-primary drop-shadow-[0_0_15px_rgba(220,38,38,1)]" width="28" height="28" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M11 2L3 7v8l8 5 8-5V7L11 2z" strokeLinejoin="round" />
              <path d="M3 7l8 5 8-5" strokeLinejoin="round" />
              <line x1="11" y1="12" x2="11" y2="20" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-linear-to-b from-white via-white/90 to-white/40 drop-shadow-sm uppercase">
            Cliffside
          </h1>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.15em] text-primary/80 drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
            Système de gestion
          </p>
        </div>

        {/* Form Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-surface/40 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-inset ring-white/10">
          <div className="absolute inset-x-0 -top-px h-[2px] bg-linear-to-r from-transparent via-primary/60 to-transparent" />
          
          <div className="mb-8 border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white tracking-wide">Accès Autorisé</h2>
            <p className="text-sm text-muted mt-1">Veuillez vous identifier pour continuer.</p>
          </div>

          <form action={action} className="space-y-6">
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted group-focus-within:text-primary transition-colors" required>Email d&apos;agent</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="agent@cliffside.local"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  className="bg-bg/50 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-white placeholder:text-muted/30 h-11"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted group-focus-within:text-primary transition-colors" required>Clé de sécurité</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                  className="bg-bg/50 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-white placeholder:text-muted/30 h-11 font-mono tracking-widest"
                />
              </div>
            </div>

            {state?.error && (
              <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 flex items-start gap-3 animate-in slide-in-from-top-2">
                <svg className="w-5 h-5 text-danger shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p role="alert" className="text-sm font-medium text-danger/90">
                  {state.error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="group relative w-full overflow-hidden rounded-xl bg-primary text-white hover:bg-primary-hover h-12 text-sm font-bold tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-[0.98]"
              disabled={isPending}
            >
              <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:transform-[skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authentification…
                  </>
                ) : (
                  "Initier Connexion"
                )}
              </span>
            </Button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/5"></div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm font-medium text-muted">
            Nouvelle recrue ?{" "}
            <Link href="/register" className="relative inline-block text-primary hover:text-white transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-bottom-right after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100">
              Soumettre un dossier
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-semibold tracking-widest text-muted/30 uppercase">
          Organisation CLIFFSIDE · Niveau d&apos;accès restreint
        </p>
      </div>
    </div>
  );
}
