import React from 'react';
import { Text, View } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { BasicInfo, BodyMetrics, DietaryRules, HealthProfile, LifestyleInfo } from '@/types';
import { basicSchema, bodySchema, healthSchema, lifestyleSchema, rulesSchema } from '@/lib/schemas';
import * as O from '@/lib/options';
import { useProfileStore } from '@/store/useProfileStore';
import { ChipsField, ChoiceField, MultiChipsField, NumberField, StepFooter, TextField, ToggleField } from '@/components/ui';

export type StepProps = { onNext: () => void; onBack?: () => void; isLast?: boolean };
const nextLabel = (isLast?: boolean) => (isLast ? 'Build my plan' : 'Continue');

export function BasicStep({ onNext }: StepProps) {
  const saved = useProfileStore((s) => s.draft.basic);
  const setSection = useProfileStore((s) => s.setSection);
  const { control, handleSubmit } = useForm<BasicInfo>({
    resolver: zodResolver(basicSchema),
    defaultValues: saved ?? { goalType: 'maintain', weeklyRateKg: 0.5 },
  });
  const goal = useWatch({ control, name: 'goalType' });
  const submit = handleSubmit((v) => {
    setSection('basic', { ...v, weeklyRateKg: v.goalType === 'maintain' ? 0 : v.weeklyRateKg });
    onNext();
  });
  return (
    <View>
      <TextField control={control} name="name" label="Name" />
      <NumberField control={control} name="age" label="Age" unit="years" />
      <ChipsField control={control} name="gender" label="Gender" options={O.GENDER_OPTIONS} />
      <ChipsField control={control} name="biologicalSex" label="Biological sex" hint="Used in the Mifflin-St Jeor energy equation." options={O.SEX_OPTIONS} />
      <ChipsField control={control} name="goalType" label="Goal" options={O.GOAL_OPTIONS} />
      {goal !== 'maintain' && (
        <ChipsField control={control} name="weeklyRateKg" label="Pace" options={goal === 'gain_muscle' ? O.RATE_OPTIONS.slice(0, 2) : O.RATE_OPTIONS} />
      )}
      <NumberField control={control} name="targetWeightKg" label="Target weight" unit="kg" />
      <StepFooter onNext={submit} />
    </View>
  );
}

export function BodyStep({ onNext, onBack }: StepProps) {
  const saved = useProfileStore((s) => s.draft.body);
  const setSection = useProfileStore((s) => s.setSection);
  const { control, handleSubmit } = useForm<BodyMetrics>({ resolver: zodResolver(bodySchema), defaultValues: saved });
  const submit = handleSubmit((v) => { setSection('body', v); onNext(); });
  const [h, w] = useWatch({ control, name: ['heightCm', 'weightKg'] });
  const bmi = h && w ? w / (h / 100) ** 2 : null;
  return (
    <View>
      <NumberField control={control} name="heightCm" label="Height" unit="cm" />
      <NumberField control={control} name="weightKg" label="Current weight" unit="kg" />
      <NumberField control={control} name="waistCm" label="Waist circumference" unit="cm" hint="Measure at the navel, relaxed." />
      <NumberField control={control} name="bodyFatPct" label="Body fat (optional)" unit="%" hint="Leave empty and we will estimate it." />
      {bmi !== null && bmi > 8 && bmi < 80 && (
        <View className="rounded-xl bg-pith p-3"><Text className="text-sm text-ink">Your BMI is {bmi.toFixed(1)}</Text></View>
      )}
      <StepFooter onBack={onBack} onNext={submit} />
    </View>
  );
}

export function LifestyleStep({ onNext, onBack }: StepProps) {
  const saved = useProfileStore((s) => s.draft.lifestyle);
  const setSection = useProfileStore((s) => s.setSection);
  const { control, handleSubmit } = useForm<LifestyleInfo>({ resolver: zodResolver(lifestyleSchema), defaultValues: saved });
  const submit = handleSubmit((v) => { setSection('lifestyle', v); onNext(); });
  return (
    <View>
      <ChoiceField control={control} name="activityLevel" label="How active are you in a typical week?" options={O.ACTIVITY_OPTIONS} />
      <StepFooter onBack={onBack} onNext={submit} />
    </View>
  );
}

export function HealthStep({ onNext, onBack }: StepProps) {
  const saved = useProfileStore((s) => s.draft.health);
  const setSection = useProfileStore((s) => s.setSection);
  const { control, handleSubmit } = useForm<HealthProfile>({
    resolver: zodResolver(healthSchema),
    defaultValues: saved ?? { conditions: [], allergies: [] },
  });
  const submit = handleSubmit((v) => { setSection('health', v); onNext(); });
  return (
    <View>
      <MultiChipsField control={control} name="conditions" label="Medical conditions" hint="Select all that apply. Skip if none." options={O.CONDITION_OPTIONS} />
      <MultiChipsField control={control} name="allergies" label="Allergies and intolerances" options={O.ALLERGEN_OPTIONS} />
      <ChoiceField control={control} name="diet" label="Diet style" options={O.DIET_OPTIONS} />
      <StepFooter onBack={onBack} onNext={submit} />
    </View>
  );
}

export function RulesStep({ onNext, onBack, isLast }: StepProps) {
  const saved = useProfileStore((s) => s.draft.rules);
  const setSection = useProfileStore((s) => s.setSection);
  const { control, handleSubmit } = useForm<DietaryRules>({
    resolver: zodResolver(rulesSchema),
    defaultValues: saved ?? { minProteinPerKg: 1.2, zeroAddedSugar: false, fasting: 'none', windowStartHour: 7 },
  });
  const submit = handleSubmit((v) => { setSection('rules', v); onNext(); });
  return (
    <View>
      <ChipsField control={control} name="minProteinPerKg" label="Minimum protein" hint="Your plan will never go below this floor." options={O.PROTEIN_FLOOR_OPTIONS} />
      <ToggleField control={control} name="zeroAddedSugar" label="Zero added sugar" hint="Always on if you have diabetes." />
      <ChipsField control={control} name="fasting" label="Intermittent fasting" options={O.FASTING_OPTIONS} />
      <ChipsField control={control} name="windowStartHour" label="First meal of the day" options={O.START_HOUR_OPTIONS} />
      <StepFooter onBack={onBack} onNext={submit} nextLabel={nextLabel(isLast)} />
    </View>
  );
}
