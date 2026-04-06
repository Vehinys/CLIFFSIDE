import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { OnlineTracker } from "@/components/OnlineTracker";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "CLIFFSIDE",
  description: "Système de gestion — Organisation GTA RP StoryLife",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="h-full bg-bg text-text antialiased">
        <OnlineTracker />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
