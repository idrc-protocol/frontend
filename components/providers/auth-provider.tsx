"use client";

import type { Session, User } from "@/lib/auth-client";

import { createContext, useContext, ReactNode } from "react";

import { useSession } from "@/lib/auth-client";

interface AuthContextType {
  user: User | null;
  session: { user: User; session: Session } | null;
  isLoading: boolean;
  isPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const value: AuthContextType = {
    user: session?.user || null,
    session: session || null,
    isLoading: isPending,
    isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
