"use client";

import { AuthProvider } from "@/components/auth/auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
