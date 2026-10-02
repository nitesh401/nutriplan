import { calcBMR, calcTDEE, calcBMI, calcWaterMl, calcCalorieTarget, estimateBodyFat } from './nutritionEngine.ts';

let passed = 0, failed = 0;
function check(name: string, actual: number | string, expected: number | string, tol = 0) {
  const ok = typeof actual === 'number' && typeof expected === 'number' ? Math.abs(actual - expected) <= tol : actual === expected;
  ok ? passed++ : failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (got ${actual}, expected ${expected}${tol ? ` ±${tol}` : ''})`);
}
const mk = (o: { sex?: string; age?: number; w?: number; h?: number; act?: string; goal?: string; rate?: number; tw?: number; cond?: string[]; diet?: string; minP?: number; sugar?: boolean }) => ({
  basic: { name: 'T', age: o.age ?? 30, gender: 'man', biologicalSex: o.sex ?? 'male', goalType: o.goal ?? 'maintain', weeklyRateKg: o.rate ?? 0, targetWeightKg: o.tw ?? 75 },
  body: { heightCm: o.h ?? 180, weightKg: o.w ?? 80, waistCm: 90 },
  lifestyle: { activityLevel: o.act ?? 'moderate' },
  health: { conditions: o.cond ?? [], allergies: [], diet: o.diet ?? 'balanced' },
  rules: { minProteinPerKg: o.minP ?? 1.2, zeroAddedSugar: o.sugar ?? false, fasting: 'none', windowStartHour: 7 },
}) as never;

console.log('NutriPlan nutrition engine: test suite\n');
console.log('-- Formulas --');
check('TC01 BMR male 80kg/180cm/30y', calcBMR('male', 80, 180, 30), 1780);
check('TC02 BMR female 60kg/165cm/28y', calcBMR('female', 60, 165, 28), 1330.25, 0.01);
check('TC03 TDEE moderate (x1.55)', calcTDEE(1780, 'moderate'), 2759, 0.01);
check('TC04 BMI 80kg/180cm', Math.round(calcBMI(80, 180) * 10) / 10, 24.7);
check('TC05 Body-fat estimate male 30y BMI 24.7', estimateBodyFat(24.7, 30, 'male'), 20.3, 0.1);
check('TC06 Water 80kg very active (ml)', calcWaterMl(80, 'very'), 3300);
check('TC07 Water clamped at 4.5 L (150kg extra)', calcWaterMl(150, 'extra'), 4500);

console.log('\n-- Calorie targets --');
const lose = calcCalorieTarget(mk({ goal: 'lose', rate: 0.5 }));
check('TC08 Lose 0.5 kg/wk target kcal', lose.targetKcal, 2209, 1);
check('TC09 Weeks to lose 5 kg', lose.weeksToGoal ?? -1, 10);
const gain = calcCalorieTarget(mk({ sex: 'male', age: 25, w: 70, h: 175, act: 'light', goal: 'gain_muscle', rate: 0.5, tw: 75 }));
check('TC10 Gain 0.5 kg/wk target kcal', gain.targetKcal, 2852, 1);
const floor = calcCalorieTarget(mk({ sex: 'female', age: 25, w: 50, h: 160, act: 'sedentary', goal: 'lose', rate: 1, tw: 45 }));
check('TC11 Female safe floor 1200 kcal applied', floor.targetKcal, 1200);
check('TC12 Floor adds a user-facing note', floor.notes.length > 0 ? 'note' : 'none', 'note');
const wrongWay = calcCalorieTarget(mk({ goal: 'lose', rate: 0.5, tw: 90 }));
check('TC13 Target above weight while losing: no timeline', String(wrongWay.weeksToGoal), 'null');

console.log('\n-- Macros and guardrails --');
const bal = lose.macros;
check('TC14 Macro percents sum to 100', bal.proteinPct + bal.carbsPct + bal.fatPct, 100);
check('TC15 Macro kcal match target (gram rounding)', bal.proteinG * 4 + bal.carbsG * 4 + bal.fatG * 9, lose.targetKcal, 10);
check('TC16 Protein honours 1.2 g/kg floor (>= 96 g)', bal.proteinG >= 96 ? 'ok' : 'low', 'ok');
check('TC17 CKD caps protein at 0.8 g/kg (64 g)', calcCalorieTarget(mk({ cond: ['ckd'] })).macros.proteinG, 64);
check('TC18 Hypertension sodium limit (mg)', calcCalorieTarget(mk({ cond: ['hypertension'] })).macros.sodiumMaxMg, 1500);
check('TC19 Diabetes forces zero added sugar (g)', calcCalorieTarget(mk({ cond: ['diabetes'] })).macros.addedSugarMaxG, 0);
check('TC20 Keto carbs capped at <= 50 g', calcCalorieTarget(mk({ diet: 'keto' })).macros.carbsG <= 50 ? 'ok' : 'over', 'ok');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
