import type {
  ActivityLevel, BiologicalSex, CalorieTarget, Condition, DietType, Guardrail, GoalType, MacroTargets, UserProfile,
} from '@/types';

export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

export const KCAL_PER_KG = 7700; // energy equivalent of 1 kg body mass change
export const MAX_DEFICIT_FRACTION = 0.25; // never cut more than 25% of TDEE
export const KCAL_FLOOR: Record<BiologicalSex, number> = { male: 1500, female: 1200 };

const FAT_SHARE_OF_REMAINING: Record<DietType, number> = {
  balanced: 0.35, mediterranean: 0.45, vegetarian: 0.33, vegan: 0.3, paleo: 0.45, keto: 0.9,
};

/** Mifflin-St Jeor: 10w + 6.25h - 5a + s  (s = +5 male, -161 female) */
export function calcBMR(sex: BiologicalSex, weightKg: number, heightCm: number, age: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
}

export const calcTDEE = (bmr: number, level: ActivityLevel): number => bmr * ACTIVITY_MULTIPLIER[level];

export const calcBMI = (weightKg: number, heightCm: number): number => weightKg / (heightCm / 100) ** 2;

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy range';
  if (bmi < 30) return 'Overweight';
  return 'Obese range';
}

/** Deurenberg estimate, used only when the user does not supply body fat. */
export function estimateBodyFat(bmi: number, age: number, sex: BiologicalSex): number {
  const bf = 1.2 * bmi + 0.23 * age - 10.8 * (sex === 'male' ? 1 : 0) - 5.4;
  return Math.round(Math.min(Math.max(bf, 3), 60) * 10) / 10;
}

/** Signed kcal/day implied by a goal and weekly rate (kg/week). */
export function dailyEnergyAdjustment(goal: GoalType, weeklyRateKg: number): number {
  if (goal === 'maintain') return 0;
  const daily = (weeklyRateKg * KCAL_PER_KG) / 7;
  return goal === 'lose' ? -daily : daily;
}

/** Water target in ml: 35 ml/kg plus an activity allowance, clamped to 1.5-4.5 L. */
export function calcWaterMl(weightKg: number, level: ActivityLevel): number {
  const extra = level === 'extra' || level === 'very' ? 500 : level === 'moderate' ? 250 : 0;
  const ml = Math.min(Math.max(35 * weightKg + extra, 1500), 4500);
  return Math.round(ml / 50) * 50;
}

export function calcMacros(targetKcal: number, profile: UserProfile): MacroTargets {
  const { basic, body, health, rules } = profile;
  const has = (c: Condition) => health.conditions.includes(c);

  // Protein: goal-based g/kg, limited to 35% of energy, never below the user's mandatory floor.
  const goalPerKg = basic.goalType === 'maintain' ? 1.4 : 1.8;
  let protein = Math.max(
    Math.min(goalPerKg * body.weightKg, (targetKcal * 0.35) / 4),
    rules.minProteinPerKg * body.weightKg,
  );
  if (has('ckd')) protein = Math.min(protein, 0.8 * body.weightKg); // safety cap overrides the floor
  protein = Math.round(protein);

  const remaining = Math.max(targetKcal - protein * 4, 0);
  let fatShare = FAT_SHARE_OF_REMAINING[health.diet];
  if ((has('diabetes') || has('pcos')) && health.diet !== 'keto') fatShare = Math.min(fatShare + 0.08, 0.6);

  let carbs = (remaining * (1 - fatShare)) / 4;
  if (health.diet === 'keto') carbs = Math.min(carbs, 50);
  const fat = (remaining - carbs * 4) / 9;

  const carbsG = Math.round(carbs);
  const fatG = Math.round(fat);
  const proteinPct = Math.round(((protein * 4) / targetKcal) * 100);
  const fatPct = Math.round(((fatG * 9) / targetKcal) * 100);

  const zeroSugar = rules.zeroAddedSugar || has('diabetes');
  return {
    proteinG: protein,
    carbsG,
    fatG,
    proteinPct,
    fatPct,
    carbsPct: Math.max(100 - proteinPct - fatPct, 0),
    fiberG: Math.round((14 * targetKcal) / 1000),
    addedSugarMaxG: zeroSugar ? 0 : Math.floor((targetKcal * 0.1) / 4),
    sodiumMaxMg: has('hypertension') ? 1500 : has('ckd') ? 2000 : 2300,
  };
}

export function calcCalorieTarget(profile: UserProfile): CalorieTarget {
  const { basic, body, lifestyle } = profile;
  const notes: string[] = [];
  const bmr = Math.round(calcBMR(basic.biologicalSex, body.weightKg, body.heightCm, basic.age));
  const tdee = Math.round(calcTDEE(bmr, lifestyle.activityLevel));

  let adjustment = dailyEnergyAdjustment(basic.goalType, basic.weeklyRateKg);
  const maxDeficit = tdee * MAX_DEFICIT_FRACTION;
  if (adjustment < -maxDeficit) {
    adjustment = -maxDeficit;
    notes.push('Deficit capped at 25% of your maintenance calories for safety.');
  }
  let targetKcal = Math.round(tdee + adjustment);
  const floor = KCAL_FLOOR[basic.biologicalSex];
  if (targetKcal < floor) {
    targetKcal = floor;
    notes.push(`Calories raised to the safe minimum of ${floor} kcal/day.`);
  }
  adjustment = targetKcal - tdee;
  const weeklyChangeKg = Math.round(((adjustment * 7) / KCAL_PER_KG) * 100) / 100;

  const delta = basic.targetWeightKg - body.weightKg;
  let weeksToGoal: number | null = null;
  if (basic.goalType !== 'maintain') {
    if (weeklyChangeKg !== 0 && Math.sign(delta) === Math.sign(weeklyChangeKg)) {
      weeksToGoal = Math.ceil(Math.abs(delta) / Math.abs(weeklyChangeKg));
    } else {
      notes.push('Your target weight points the opposite way from your goal, so no timeline is shown.');
    }
  }
  return { bmr, tdee, adjustment, targetKcal, weeklyChangeKg, weeksToGoal, macros: calcMacros(targetKcal, profile), notes };
}

export function buildGuardrails(profile: UserProfile, target: CalorieTarget, waterMl: number): Guardrail[] {
  const { health, rules, body, basic } = profile;
  const m = target.macros;
  const has = (c: Condition) => health.conditions.includes(c);
  const floor = KCAL_FLOOR[basic.biologicalSex];
  const g: Guardrail[] = [
    { id: 'protein', level: 'critical', title: `At least ${m.proteinG} g protein`, detail: `Never below ${rules.minProteinPerKg} g per kg of body weight.` },
    { id: 'water', level: 'standard', title: `${(waterMl / 1000).toFixed(2)} L water`, detail: 'Minimum daily fluid, spread through the day.' },
    { id: 'sodium', level: has('hypertension') || has('ckd') ? 'critical' : 'standard', title: `Sodium under ${m.sodiumMaxMg} mg`, detail: has('hypertension') ? 'Lower limit applied for hypertension.' : 'General daily limit.' },
    { id: 'sugar', level: m.addedSugarMaxG === 0 ? 'critical' : 'standard', title: m.addedSugarMaxG === 0 ? 'Zero added sugar' : `Added sugar under ${m.addedSugarMaxG} g`, detail: m.addedSugarMaxG === 0 ? 'Applied by your rule or for diabetes.' : 'Under 10% of daily energy.' },
    { id: 'fiber', level: 'standard', title: `Fiber ${m.fiberG} g or more`, detail: '14 g per 1,000 kcal.' },
    { id: 'floor', level: 'critical', title: `Never below ${floor} kcal`, detail: 'Safe minimum energy intake for your sex.' },
  ];
  if (has('celiac')) g.push({ id: 'gluten', level: 'critical', title: 'Strictly gluten-free', detail: 'Check labels and avoid cross-contact.' });
  if (has('ckd')) g.push({ id: 'ckd', level: 'critical', title: 'Protein capped at 0.8 g/kg', detail: 'Confirm protein and fluid targets with your nephrologist.' });
  if (has('thyroid')) g.push({ id: 'thyroid', level: 'standard', title: 'Keep iodine intake steady', detail: 'Avoid large swings and keep medication timing consistent with meals.' });
  if (has('high_cholesterol')) g.push({ id: 'chol', level: 'standard', title: 'Limit saturated fat', detail: 'Prefer unsaturated fats, fish, nuts and legumes.' });
  if (body.weightKg < 40) g.push({ id: 'low', level: 'critical', title: 'Low body weight', detail: 'Plan this with a clinician before starting.' });
  return g;
}
