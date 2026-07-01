"use client";

/* =============================================================
   ÉTAT GLOBAL — CLUB PRIVÉ / FIDÉLITÉ
   Gère le statut du membre (tiers), ses points de fidélité et
   l'accès aux drops exclusifs. Alimenté à terme par Salesforce
   (voir lib/salesforce.ts). Consommé via usePrivateClub().
   ============================================================= */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Paliers du club privé, par ordre croissant de prestige. */
export type MembershipTier = "guest" | "silver" | "platinum" | "obsidian";

export interface ClubMember {
  id: string;
  firstName: string;
  tier: MembershipTier;
  loyaltyPoints: number;
}

/** Seuils de points pour débloquer chaque palier. */
const TIER_THRESHOLDS: Record<Exclude<MembershipTier, "guest">, number> = {
  silver: 1_000,
  platinum: 10_000,
  obsidian: 50_000,
};

function computeTier(points: number): MembershipTier {
  if (points >= TIER_THRESHOLDS.obsidian) return "obsidian";
  if (points >= TIER_THRESHOLDS.platinum) return "platinum";
  if (points >= TIER_THRESHOLDS.silver) return "silver";
  return "guest";
}

interface PrivateClubContextValue {
  member: ClubMember | null;
  isMember: boolean;
  /** Accès réservé aux paliers platinum et obsidian. */
  hasExclusiveAccess: boolean;
  signIn: (member: ClubMember) => void;
  signOut: () => void;
  addPoints: (points: number) => void;
}

const PrivateClubContext = createContext<PrivateClubContextValue | null>(null);

export function PrivateClubProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<ClubMember | null>(null);

  const addPoints = useCallback((points: number) => {
    setMember((current) => {
      if (!current) return current;
      const loyaltyPoints = current.loyaltyPoints + points;
      return { ...current, loyaltyPoints, tier: computeTier(loyaltyPoints) };
    });
  }, []);

  const value = useMemo<PrivateClubContextValue>(
    () => ({
      member,
      isMember: member !== null,
      hasExclusiveAccess:
        member?.tier === "platinum" || member?.tier === "obsidian",
      signIn: (m) => setMember({ ...m, tier: computeTier(m.loyaltyPoints) }),
      signOut: () => setMember(null),
      addPoints,
    }),
    [member, addPoints],
  );

  return (
    <PrivateClubContext.Provider value={value}>
      {children}
    </PrivateClubContext.Provider>
  );
}

/** Hook d'accès au Club Privé. Lève une erreur hors provider. */
export function usePrivateClub(): PrivateClubContextValue {
  const ctx = useContext(PrivateClubContext);
  if (!ctx) {
    throw new Error("usePrivateClub doit être utilisé dans <PrivateClubProvider>.");
  }
  return ctx;
}
