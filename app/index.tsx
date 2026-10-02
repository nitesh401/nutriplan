import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { toProfile, useHydrated, useProfileStore } from '@/store/useProfileStore';

export default function Index() {
  const hydrated = useHydrated();
  const draft = useProfileStore((s) => s.draft);
  if (!hydrated) return <View className="flex-1 items-center justify-center bg-chalk"><ActivityIndicator color="#2E7D55" /></View>;
  return <Redirect href={toProfile(draft) ? '/dashboard' : '/onboarding'} />;
}
