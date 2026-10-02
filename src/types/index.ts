// Single source of truth for enums: const tuples drive both TS unions and Zod enums.
export const GENDERS = ['woman', 'man', 'non_binary', 'undisclosed'] as const;
export const SEXES = ['male', 'female'] as const;
export const GOALS = ['lose', 'maintain', 'gain_muscle'] as const;
export const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'very', 'extra'] as const;
export const CONDITIONS = ['diabetes', 'hypertension', 'pcos', 'thyroid', 'celiac', 'high_cholesterol', 'ckd'] as const;
export const ALLERGENS = ['lactose', 'nuts', 'gluten', 'shellfish', 'eggs', 'soy', 'fish'] as const;
export const DIETS = ['balanced', 'mediterranean', 'vegetarian', 'vegan', 'keto', 'paleo'] as const;
export const FASTING_PROTOCOLS = ['none', '12:12', '14:10', '16:8'] as const;

export type Gender = (typeof GENDERS)[number];
export type BiologicalSex = (typeof SEXES)[number];
export type GoalType = (typeof GOALS)[number];
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];
export type Condition = (typeof CONDITIONS)[number];
export type Allergen = (typeof ALLERGENS)[number];
export type DietType = (typeof DIETS)[number];
export type FastingProtocol = (typeof FASTING_PROTOCOLS)[number];
export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface BasicInfo {
  name: string;
  age: number;
  gender: Gender;
  biologicalSex: BiologicalSex; // used by Mifflin-St Jeor
  goalType: GoalType;
  weeklyRateKg: number; // magnitude, kg/week; 0 when maintaining
  targetWeightKg: number;
}

export interface BodyMetrics {
  heightCm: number;
  weightKg: number;
  waistCm: number;
  bodyFatPct?: number; // optional; estimated when absent
}

export interface LifestyleInfo {
  activityLevel: ActivityLevel;
}

export interface HealthProfile {
  conditions: Condition[];
  allergies: Allergen[];
  diet: DietType;
}

export interface DietaryRules {
  minProteinPerKg: number;
  zeroAddedSugar: boolean;
  fasting: FastingProtocol;
  windowStartHour: number; // first meal, 24h clock
}

export interface UserProfile {
  basic: BasicInfo;
  body: BodyMetrics;
  lifestyle: LifestyleInfo;
  health: HealthProfile;
  rules: DietaryRules;
}

export interface MacroTargets {
  proteinG: number;
  carbsG: number;
  fatG: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  fiberG: number;
  addedSugarMaxG: number;
  sodiumMaxMg: number;
}

export interface CalorieTarget {
  bmr: number;
  tdee: number;
  adjustment: number; // signed kcal/day vs TDEE
  targetKcal: number;
  weeklyChangeKg: number; // signed, after safety limits
  weeksToGoal: number | null;
  macros: MacroTargets;
  notes: string[];
}

export interface Guardrail {
  id: string;
  title: string;
  detail: string;
  level: 'critical' | 'standard';
}

export interface MealOption {
  id: string;
  slot: MealSlot;
  name: string;
  diets: DietType[];
  allergens: Allergen[];
}

export interface PlannedMeal {
  slot: MealSlot;
  label: string;
  time: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  options: MealOption[];
}

export interface DietPlan {
  bmi: number;
  bmiCategory: string;
  bodyFatPct: number;
  bodyFatEstimated: boolean;
  waistToHeight: number;
  waterMl: number;
  target: CalorieTarget;
  guardrails: Guardrail[];
  meals: PlannedMeal[];
}
