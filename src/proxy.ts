/**
 * Edge-compatible proxy (Next.js 16 convention, anciennement "middleware").
 * N'importe PAS depuis src/lib/auth.ts (qui charge Prisma / Node.js built-ins).
 * Utilise auth.config.ts — safe pour l'Edge Runtime.
 */
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isAuthenticated = !!req.auth;

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
