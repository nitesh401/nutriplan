import React, { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import type { DietPlan, Guardrail, PlannedMeal } from '@/types';
import { generateDietPlan } from '@/lib/dietPlan';
import { toProfile, useProfileStore } from '@/store/useProfileStore';
import { Button, Card } from '@/components/ui';
import { CalorieGauge, MACRO_COLORS } from '@/components/CalorieGauge';
import { Bar } from '@/components/Bars';

type Row =
  | { type: 'hero' } | { type: 'energy' } | { type: 'macros' } | { type: 'vitals' }
  | { type: 'title'; text: string } | { type: 'rule'; rule: Guardrail } | { type: 'meal'; meal: PlannedMeal } | { type: 'footer' };

const goalText = (plan: DietPlan, goal: string, target: number) => {
  const t = plan.target;
  if (goal === 'maintain') return 'Maintain your current weight';
  const pace = `${goal === 'lose' ? 'Lose' : 'Gain'} ${Math.abs(t.weeklyChangeKg)} kg per week`;
  return t.weeksToGoal ? `${pace}, about ${t.weeksToGoal} weeks to ${target} kg` : pace;
};

export default function Dashboard() {
  const router = useRouter();
  const draft = useProfileStore((s) => s.draft);
  const setStep = useProfileStore((s) => s.setStep);
  const reset = useProfileStore((s) => s.reset);
  const profile = useMemo(() => toProfile(draft), [draft]);
  const plan = useMemo(() => (profile ? generateDietPlan(profile) : null), [profile]);

  useEffect(() => { if (!profile) router.replace('/onboarding'); }, [profile, router]);

  const rows = useMemo<Row[]>(() => {
    if (!plan) return [];
    return [
      { type: 'hero' }, { type: 'energy' }, { type: 'macros' }, { type: 'vitals' },
      { type: 'title', text: 'Guardrails you set and safety limits' },
      ...plan.guardrails.map((rule): Row => ({ type: 'rule', rule })),
      { type: 'title', text: "Today's meals" },
      ...plan.meals.map((meal): Row => ({ type: 'meal', meal })),
      { type: 'footer' },
    ];
  }, [plan]);

  if (!plan || !profile) return null;
  const { target } = plan;
  const m = target.macros;
  const maxE = Math.max(target.tdee, target.targetKcal, target.bmr);

  const renderItem = ({ item }: { item: Row }) => {
    switch (item.type) {
      case 'hero':
        return (
          <View>
            <Text className="text-2xl font-bold text-ink">Plan for {profile.basic.name}</Text>
            <Text className="mt-1 text-base text-ink/70">{goalText(plan, profile.basic.goalType, profile.basic.targetWeightKg)}</Text>
            <View className="mt-5 items-center"><CalorieGauge kcal={target.targetKcal} macros={m} /></View>
            {target.notes.map((n) => (
              <View key={n} className="mt-3 rounded-xl border border-saffron bg-white p-3"><Text className="text-sm text-ink">{n}</Text></View>
            ))}
          </View>
        );
      case 'energy':
        return (
          <Card>
            <Text className="mb-3 text-base font-semibold text-ink">How we got there</Text>
            <Bar label="BMR (Mifflin-St Jeor)" value={`${target.bmr} kcal`} fraction={target.bmr / maxE} color="#9DB5A8" />
            <Bar label="TDEE with activity" value={`${target.tdee} kcal`} fraction={target.tdee / maxE} color="#2E7D55" />
            <Bar label="Daily target" value={`${target.targetKcal} kcal`} right={`${target.adjustment >= 0 ? '+' : ''}${target.adjustment}`} fraction={target.targetKcal / maxE} color="#14211C" />
          </Card>
        );
      case 'macros':
        return (
          <Card>
            <Text className="mb-3 text-base font-semibold text-ink">Macros</Text>
            <Bar label="Protein" value={`${m.proteinG} g`} right={`${m.proteinPct}%`} fraction={m.proteinPct / 100} color={MACRO_COLORS.protein} />
            <Bar label="Carbs" value={`${m.carbsG} g`} right={`${m.carbsPct}%`} fraction={m.carbsPct / 100} color={MACRO_COLORS.carbs} />
            <Bar label="Fat" value={`${m.fatG} g`} right={`${m.fatPct}%`} fraction={m.fatPct / 100} color={MACRO_COLORS.fat} />
          </Card>
        );
      case 'vitals': {
        const stats: [string, string][] = [
          ['Water', `${(plan.waterMl / 1000).toFixed(2)} L`],
          ['BMI', `${plan.bmi} (${plan.bmiCategory})`],
          ['Body fat', `${plan.bodyFatPct}%${plan.bodyFatEstimated ? ' est.' : ''}`],
          ['Waist to height', `${plan.waistToHeight}${plan.waistToHeight >= 0.5 ? ' (above 0.5)' : ''}`],
        ];
        return (
          <View className="flex-row flex-wrap gap-3">
            {stats.map(([k, v]) => (
              <View key={k} className="min-w-[46%] flex-1 rounded-2xl bg-pith p-3">
                <Text className="text-xs text-ink/60">{k}</Text>
                <Text className="mt-0.5 text-base font-semibold text-ink">{v}</Text>
              </View>
            ))}
          </View>
        );
      }
      case 'title':
        return <Text className="mt-2 text-lg font-bold text-ink">{item.text}</Text>;
      case 'rule':
        return (
          <View className={`rounded-xl border-l-4 bg-white p-3 ${item.rule.level === 'critical' ? 'border-warn' : 'border-leaf'}`}>
            <Text className="text-base font-semibold text-ink">{item.rule.title}</Text>
            <Text className="mt-0.5 text-sm text-ink/70">{item.rule.detail}</Text>
          </View>
        );
      case 'meal': {
        const { meal } = item;
        return (
          <Card>
            <View className="flex-row items-baseline justify-between">
              <Text className="text-lg font-bold text-ink">{meal.label}</Text>
              <Text className="text-sm text-ink/60">{meal.time}</Text>
            </View>
            <Text className="mt-0.5 text-sm text-ink/80">
              {meal.kcal} kcal · P {meal.proteinG} g · C {meal.carbsG} g · F {meal.fatG} g
            </Text>
            <View className="mt-3 gap-1.5">
              {meal.options.length === 0 ? (
                <Text className="text-sm text-warn">No built-in suggestions fit your restrictions. A dietitian can build this meal with you.</Text>
              ) : (
                meal.options.map((o) => <Text key={o.id} className="text-sm text-ink">• {o.name}</Text>)
              )}
            </View>
          </Card>
        );
      }
      case 'footer':
        return (
          <View className="gap-3 pb-6">
            <Button title="Edit my answers" variant="quiet" onPress={() => { setStep(0); router.push('/onboarding'); }} />
            <Button title="Start over" variant="quiet" onPress={() => { reset(); router.replace('/onboarding'); }} />
            <Text className="text-xs text-ink/50">
              This plan is general guidance, not medical advice. If you have a medical condition, review it with a doctor or registered dietitian.
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-chalk">
      <FlashList
        data={rows}
        renderItem={renderItem}
        getItemType={(r) => r.type}
        keyExtractor={(r, i) => (r.type === 'rule' ? r.rule.id : r.type === 'meal' ? r.meal.slot : `${r.type}-${i}`)}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}
