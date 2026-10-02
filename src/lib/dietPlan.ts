import type { DietPlan, UserProfile } from '@/types';
import { bmiCategory, buildGuardrails, calcBMI, calcCalorieTarget, calcWaterMl, estimateBodyFat } from './nutritionEngine';
import { buildMealPlan } from './mealPlanner';

export function generateDietPlan(profile: UserProfile): DietPlan {
  const { body, basic, lifestyle } = profile;
  const bmi = calcBMI(body.weightKg, body.heightCm);
  const target = calcCalorieTarget(profile);
  const waterMl = calcWaterMl(body.weightKg, lifestyle.activityLevel);
  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: bmiCategory(bmi),
    bodyFatPct: body.bodyFatPct ?? estimateBodyFat(bmi, basic.age, basic.biologicalSex),
    bodyFatEstimated: body.bodyFatPct === undefined,
    waistToHeight: Math.round((body.waistCm / body.heightCm) * 100) / 100,
    waterMl,
    target,
    guardrails: buildGuardrails(profile, target, waterMl),
    meals: buildMealPlan(profile, target),
  };
}
