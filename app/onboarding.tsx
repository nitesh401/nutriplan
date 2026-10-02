import React, { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { TOTAL_STEPS, useProfileStore } from '@/store/useProfileStore';
import { BasicStep, BodyStep, HealthStep, LifestyleStep, RulesStep, type StepProps } from '@/features/onboarding/steps';

const STEPS: { title: string; subtitle: string; Comp: React.ComponentType<StepProps> }[] = [
  { title: 'About you', subtitle: 'Who the plan is for and what you are aiming for.', Comp: BasicStep },
  { title: 'Body measurements', subtitle: 'Used to calculate your energy needs.', Comp: BodyStep },
  { title: 'Activity', subtitle: 'Pick the level that matches an average week.', Comp: LifestyleStep },
  { title: 'Health and diet', subtitle: 'Conditions and allergies change what is safe to eat.', Comp: HealthStep },
  { title: 'Your rules', subtitle: 'Non-negotiables the plan has to respect.', Comp: RulesStep },
];

export default function Onboarding() {
  const router = useRouter();
  const step = useProfileStore((s) => s.step);
  const setStep = useProfileStore((s) => s.setStep);
  const direction = useRef<'forward' | 'back'>('forward');
  const progress = useSharedValue((step + 1) / TOTAL_STEPS);
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const index = Math.min(step, STEPS.length - 1);
  useEffect(() => { progress.value = withTiming((index + 1) / TOTAL_STEPS, { duration: 350 }); }, [index, progress]);

  const { title, subtitle, Comp } = STEPS[index]!;
  const isLast = index === STEPS.length - 1;
  const forward = direction.current === 'forward';

  const next = () => {
    if (isLast) { router.replace('/dashboard'); return; }
    direction.current = 'forward';
    setStep(index + 1);
  };
  const back = () => { direction.current = 'back'; setStep(Math.max(index - 1, 0)); };

  return (
    <SafeAreaView className="flex-1 bg-chalk">
      <View className="px-5 pt-3">
        <Text className="text-xs font-medium text-ink/60">Step {index + 1} of {TOTAL_STEPS}</Text>
        <View className="mt-2 h-2 overflow-hidden rounded-full bg-pith">
          <Animated.View className="h-2 rounded-full bg-leaf" style={barStyle} />
        </View>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          <Animated.View
            key={index}
            entering={(forward ? SlideInRight : SlideInLeft).duration(260)}
            exiting={(forward ? SlideOutLeft : SlideOutRight).duration(180)}
          >
            <Text className="text-3xl font-bold text-ink">{title}</Text>
            <Text className="mb-6 mt-1 text-base text-ink/70">{subtitle}</Text>
            <Comp onNext={next} onBack={index > 0 ? back : undefined} isLast={isLast} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
