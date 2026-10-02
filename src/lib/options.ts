import type { ActivityLevel, Allergen, Condition, DietType, FastingProtocol, Gender, GoalType, BiologicalSex } from '@/types';

type Opt<T> = { value: T; label: string; description?: string };

export const GENDER_OPTIONS: Opt<Gender>[] = [
  { value: 'woman', label: 'Woman' }, { value: 'man', label: 'Man' },
  { value: 'non_binary', label: 'Non-binary' }, { value: 'undisclosed', label: 'Prefer not to say' },
];
export const SEX_OPTIONS: Opt<BiologicalSex>[] = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }];
export const GOAL_OPTIONS: Opt<GoalType>[] = [
  { value: 'lose', label: 'Lose weight' }, { value: 'maintain', label: 'Maintain' }, { value: 'gain_muscle', label: 'Gain muscle' },
];
export const RATE_OPTIONS: Opt<number>[] = [
  { value: 0.25, label: '0.25 kg/wk' }, { value: 0.5, label: '0.5 kg/wk' }, { value: 0.75, label: '0.75 kg/wk' }, { value: 1, label: '1 kg/wk' },
];
export const ACTIVITY_OPTIONS: Opt<ActivityLevel>[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Desk job, little or no exercise (×1.2)' },
  { value: 'light', label: 'Lightly active', description: 'Exercise 1–3 days a week (×1.375)' },
  { value: 'moderate', label: 'Moderately active', description: 'Exercise 3–5 days a week (×1.55)' },
  { value: 'very', label: 'Very active', description: 'Hard exercise 6–7 days a week (×1.725)' },
  { value: 'extra', label: 'Extra active', description: 'Physical job plus daily training (×1.9)' },
];
export const CONDITION_OPTIONS: Opt<Condition>[] = [
  { value: 'diabetes', label: 'Diabetes' }, { value: 'hypertension', label: 'Hypertension' }, { value: 'pcos', label: 'PCOS' },
  { value: 'thyroid', label: 'Thyroid disorder' }, { value: 'celiac', label: 'Celiac disease' },
  { value: 'high_cholesterol', label: 'High cholesterol' }, { value: 'ckd', label: 'Chronic kidney disease' },
];
export const ALLERGEN_OPTIONS: Opt<Allergen>[] = [
  { value: 'lactose', label: 'Lactose' }, { value: 'nuts', label: 'Nuts' }, { value: 'gluten', label: 'Gluten' },
  { value: 'shellfish', label: 'Shellfish' }, { value: 'eggs', label: 'Eggs' }, { value: 'soy', label: 'Soy' }, { value: 'fish', label: 'Fish' },
];
export const DIET_OPTIONS: Opt<DietType>[] = [
  { value: 'balanced', label: 'Balanced', description: 'All food groups, no exclusions' },
  { value: 'mediterranean', label: 'Mediterranean', description: 'Olive oil, fish, legumes, whole grains' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish; dairy and eggs allowed' },
  { value: 'vegan', label: 'Vegan', description: 'Plant foods only' },
  { value: 'keto', label: 'Keto', description: 'Carbs capped at 50 g, high fat' },
  { value: 'paleo', label: 'Paleo', description: 'Whole foods, no grains or legumes' },
];
export const PROTEIN_FLOOR_OPTIONS: Opt<number>[] = [
  { value: 0.8, label: '0.8 g/kg' }, { value: 1, label: '1.0 g/kg' }, { value: 1.2, label: '1.2 g/kg' }, { value: 1.6, label: '1.6 g/kg' },
];
export const FASTING_OPTIONS: Opt<FastingProtocol>[] = [
  { value: 'none', label: 'No fasting' }, { value: '12:12', label: '12:12' }, { value: '14:10', label: '14:10' }, { value: '16:8', label: '16:8' },
];
export const START_HOUR_OPTIONS: Opt<number>[] = [6, 7, 8, 9, 10, 11, 12].map((h) => ({
  value: h, label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`,
}));
export const FASTING_WINDOW_HOURS: Record<FastingProtocol, number> = { none: 14, '12:12': 12, '14:10': 10, '16:8': 8 };
