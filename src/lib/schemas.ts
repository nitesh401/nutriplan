import { z } from 'zod';
import { ACTIVITY_LEVELS, ALLERGENS, CONDITIONS, DIETS, FASTING_PROTOCOLS, GENDERS, GOALS, SEXES } from '@/types';

const num = (label: string, min: number, max: number) =>
  z.number({ required_error: `${label} is required`, invalid_type_error: `${label} is required` })
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} must be at most ${max}`);

export const basicSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your name'),
    age: num('Age', 18, 80).int('Age must be a whole number'),
    gender: z.enum(GENDERS, { required_error: 'Choose one' }),
    biologicalSex: z.enum(SEXES, { required_error: 'Choose one' }),
    goalType: z.enum(GOALS),
    weeklyRateKg: z.number().min(0).max(1),
    targetWeightKg: num('Target weight', 30, 300),
  })
  .superRefine((v, ctx) => {
    if (v.goalType === 'gain_muscle' && v.weeklyRateKg > 0.5)
      ctx.addIssue({ code: 'custom', path: ['weeklyRateKg'], message: 'Muscle gain above 0.5 kg/week is mostly fat' });
    if (v.goalType !== 'maintain' && v.weeklyRateKg <= 0)
      ctx.addIssue({ code: 'custom', path: ['weeklyRateKg'], message: 'Choose a weekly rate' });
  });

export const bodySchema = z.object({
  heightCm: num('Height', 120, 230),
  weightKg: num('Weight', 30, 300),
  waistCm: num('Waist', 40, 200),
  bodyFatPct: z.number({ invalid_type_error: 'Enter a number' }).min(3, 'Min 3%').max(60, 'Max 60%').optional(),
});

export const lifestyleSchema = z.object({ activityLevel: z.enum(ACTIVITY_LEVELS, { required_error: 'Choose your activity level' }) });

export const healthSchema = z.object({
  conditions: z.array(z.enum(CONDITIONS)),
  allergies: z.array(z.enum(ALLERGENS)),
  diet: z.enum(DIETS, { required_error: 'Choose a diet style' }),
});

export const rulesSchema = z.object({
  minProteinPerKg: num('Protein floor', 0.8, 2.2),
  zeroAddedSugar: z.boolean(),
  fasting: z.enum(FASTING_PROTOCOLS),
  windowStartHour: num('First meal time', 5, 14).int(),
});
