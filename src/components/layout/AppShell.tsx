"use client";

import React from "react";
import { DemoSessionProvider } from "@/context/DemoSessionContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";

  return (
    <DemoSessionProvider>
      {isPublicPage ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-50/50 dark:bg-zinc-950/50">
              {children}
            </main>
          </div>
        </div>
      )}
    </DemoSessionProvider>
  );
}
