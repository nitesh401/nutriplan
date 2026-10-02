import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';

export const TOTAL_STEPS = 6; // 5 input steps + the generated plan

interface ProfileState {
  step: number;
  draft: Partial<UserProfile>;
  setStep: (step: number) => void;
  setSection: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      step: 0,
      draft: {},
      setStep: (step) => set({ step }),
      setSection: (key, value) => set((s) => ({ draft: { ...s.draft, [key]: value } })),
      reset: () => set({ step: 0, draft: {} }),
    }),
    { name: 'nutriplan-profile', storage: createJSONStorage(() => AsyncStorage), version: 1 },
  ),
);

/** Returns a complete profile, or null while any onboarding section is missing. */
export function toProfile(d: Partial<UserProfile>): UserProfile | null {
  const { basic, body, lifestyle, health, rules } = d;
  return basic && body && lifestyle && health && rules ? { basic, body, lifestyle, health, rules } : null;
}

export function useHydrated(): boolean {
  const [ready, setReady] = useState(useProfileStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useProfileStore.persist.onFinishHydration(() => setReady(true));
    setReady(useProfileStore.persist.hasHydrated());
    return unsub;
  }, []);
  return ready;
}
