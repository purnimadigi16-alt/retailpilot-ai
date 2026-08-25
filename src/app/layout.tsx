import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://retailpilot-ai-kohl.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RetailPilot AI | Intelligent Retail Operations SaaS",
    template: "%s | RetailPilot AI",
  },
  description:
    "Enterprise-grade multi-tenant retail management platform with Supabase RLS, immutable stock movement ledger, Model Context Protocol (MCP) server, and autonomous AI business agents.",
  keywords: [
    "RetailPilot AI",
    "Multi-Tenant SaaS",
    "Supabase RLS",
    "Model Context Protocol",
    "MCP Server",
    "Retail Inventory POS",
    "Autonomous AI Agents",
    "Stock Movement Ledger",
  ],
  authors: [{ name: "RetailPilot AI Engineering Team" }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "RetailPilot AI — Intelligent Retail Operations SaaS",
    description:
      "Full-fledged operational multi-tenant SaaS with Supabase RLS database isolation and live Model Context Protocol (MCP) intelligence.",
    type: "website",
    url: SITE_URL,
    siteName: "RetailPilot AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "RetailPilot AI — Intelligent Retail Operations SaaS",
    description:
      "Full-fledged operational multi-tenant SaaS with Supabase RLS database isolation and live Model Context Protocol (MCP) intelligence.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
