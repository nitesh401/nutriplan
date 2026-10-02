import type { Allergen, DietType, MealOption, MealSlot, PlannedMeal, UserProfile, CalorieTarget } from '@/types';
import { FASTING_WINDOW_HOURS } from './options';

const DIET_CODE: Record<string, DietType> = { B: 'balanced', M: 'mediterranean', G: 'vegetarian', V: 'vegan', K: 'keto', P: 'paleo' };
const m = (id: string, slot: MealSlot, name: string, diets: string, allergens: Allergen[] = []): MealOption => ({
  id, slot, name, allergens, diets: diets.split(' ').map((c) => DIET_CODE[c] as DietType),
});

// Diet codes: B balanced, M mediterranean, G vegetarian, V vegan, K keto, P paleo.
export const MEAL_LIBRARY: MealOption[] = [
  m('b1', 'breakfast', 'Oats with berries, chia and walnuts', 'B M G V', ['gluten', 'nuts']),
  m('b2', 'breakfast', 'Greek yogurt bowl with fruit and seeds', 'B M G', ['lactose']),
  m('b3', 'breakfast', 'Vegetable omelette with avocado', 'B M G K P', ['eggs']),
  m('b4', 'breakfast', 'Tofu scramble with spinach and tomato', 'B M G V K', ['soy']),
  m('b5', 'breakfast', 'Sweet potato hash with smoked salmon', 'B M P', ['fish']),
  m('b6', 'breakfast', 'Chia pudding with berries', 'B G V K P'),
  m('b7', 'breakfast', 'Quinoa porridge with apple and cinnamon', 'B M G V'),
  m('l1', 'lunch', 'Grilled chicken, quinoa and roasted vegetables', 'B M'),
  m('l2', 'lunch', 'Chickpea and vegetable curry with brown rice', 'B M G V'),
  m('l3', 'lunch', 'Salmon over leafy salad with olive oil dressing', 'B M K P', ['fish']),
  m('l4', 'lunch', 'Lentil soup with whole-grain bread', 'B M G V', ['gluten']),
  m('l5', 'lunch', 'Chicken and avocado lettuce bowl with egg', 'K P', ['eggs']),
  m('l6', 'lunch', 'Paneer tikka salad bowl', 'B G K', ['lactose']),
  m('l7', 'lunch', 'Tofu and vegetable stir-fry with rice noodles', 'B G V', ['soy']),
  m('l8', 'lunch', 'Garlic shrimp with zucchini noodles', 'M K P', ['shellfish']),
  m('s1', 'snack', 'Apple with almond butter', 'B M G V P', ['nuts']),
  m('s2', 'snack', 'Roasted chickpeas', 'B M G V'),
  m('s3', 'snack', 'Cottage cheese with cucumber', 'B G K', ['lactose']),
  m('s4', 'snack', 'Boiled eggs and olives', 'B M G K P', ['eggs']),
  m('s5', 'snack', 'Hummus with carrot sticks', 'B M G V'),
  m('s6', 'snack', 'Roasted pumpkin and sunflower seeds', 'B M G V K P'),
  m('s7', 'snack', 'Fruit with coconut yogurt', 'B G V'),
  m('d1', 'dinner', 'Baked fish, steamed greens and sweet potato', 'B M P', ['fish']),
  m('d2', 'dinner', 'Herb-roasted chicken with cauliflower rice', 'B K P'),
  m('d3', 'dinner', 'Dal with brown rice and cucumber salad', 'B G V'),
  m('d4', 'dinner', 'Stuffed peppers with beans and quinoa', 'B M G V'),
  m('d5', 'dinner', 'Tofu and mushroom stir-fry with broccoli', 'B G V K', ['soy']),
  m('d6', 'dinner', 'Lean beef with roasted vegetables', 'B K P'),
  m('d7', 'dinner', 'Whole-wheat pasta with tomato-lentil sauce', 'B M G V', ['gluten']),
  m('d8', 'dinner', 'Vegetable frittata with side salad', 'M G K', ['eggs']),
];

const SLOTS: { slot: MealSlot; label: string; share: number; at: number }[] = [
  { slot: 'breakfast', label: 'Breakfast', share: 0.25, at: 0 },
  { slot: 'lunch', label: 'Lunch', share: 0.35, at: 0.35 },
  { slot: 'snack', label: 'Snack', share: 0.1, at: 0.6 },
  { slot: 'dinner', label: 'Dinner', share: 0.3, at: 0.9 },
];

function formatTime(hours: number): string {
  const total = Math.round((hours * 60) / 5) * 5;
  const h = Math.floor(total / 60) % 24;
  const min = total % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(min).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function buildMealPlan(profile: UserProfile, target: CalorieTarget): PlannedMeal[] {
  const { health, rules } = profile;
  const excluded = new Set<Allergen>(health.allergies);
  if (health.conditions.includes('celiac')) excluded.add('gluten');
  const window = FASTING_WINDOW_HOURS[rules.fasting];

  return SLOTS.map(({ slot, label, share, at }) => ({
    slot,
    label,
    time: formatTime(rules.windowStartHour + window * at),
    kcal: Math.round(target.targetKcal * share),
    proteinG: Math.round(target.macros.proteinG * share),
    carbsG: Math.round(target.macros.carbsG * share),
    fatG: Math.round(target.macros.fatG * share),
    options: MEAL_LIBRARY.filter(
      (o) => o.slot === slot && o.diets.includes(health.diet) && !o.allergens.some((a) => excluded.has(a)),
    ).slice(0, 3),
  }));
}
