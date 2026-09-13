// RESET ERA — persistent state: profile + quest log (zustand + AsyncStorage; localStorage on web)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AnchorId, Intensity, TonePackId } from "./plan";

export type QuestLog = Record<string, boolean>; // "3-anchor" | "1-support1" ...

export interface Profile {
  tone: TonePackId;
  anchor: AnchorId;
  intensity: Intensity;
  wakeTime: string; // "06:30"
  identity: string; // Q5 raw
  planName: string;
  hook: string;
  alias: string; // stat-card display name
  email?: string;
  reminderTime?: string;
  startedAt: number; // epoch ms of Day 1 start
  comebackDone: number;
}

interface EraState {
  profile: Profile | null;
  log: QuestLog;
  hydrated: boolean;
  setHydrated: () => void;
  setProfile: (p: Profile) => void;
  completeQuest: (day: number, slot: string) => void;
  uncompleteQuest: (day: number, slot: string) => void;
  setEmail: (email: string, time: string) => void;
  reset: () => void;
}

export const useEra = create<EraState>()(
  persist(
    (set) => ({
      profile: null,
      log: {},
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      setProfile: (p) => set({ profile: p }),
      completeQuest: (day, slot) => set((s) => ({ log: { ...s.log, [`${day}-${slot}`]: true } })),
      uncompleteQuest: (day, slot) =>
        set((s) => {
          const log = { ...s.log };
          delete log[`${day}-${slot}`];
          return { log };
        }),
      setEmail: (email, time) =>
        set((s) => (s.profile ? { profile: { ...s.profile, email, reminderTime: time } } : s)),
      reset: () => set({ profile: null, log: {} }),
    }),
    {
      name: "reset-era-v0",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
