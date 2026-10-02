import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import type { MacroTargets } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export const MACRO_COLORS = { protein: '#B5395B', carbs: '#D9922B', fat: '#3F5FA8' } as const;

type ArcProps = { size: number; stroke: number; start: number; frac: number; color: string; progress: SharedValue<number> };

function Arc({ size, stroke, start, frac, color, progress }: ArcProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const props = useAnimatedProps(() => ({
    strokeDasharray: `${Math.max(frac * circ * progress.value - 3, 0)} ${circ}`,
  }));
  return (
    <AnimatedCircle
      cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
      rotation={-90 + start * 360} origin={`${size / 2}, ${size / 2}`} animatedProps={props}
    />
  );
}

/** Ring split by where the calories come from (protein / carbs / fat). */
export function CalorieGauge({ kcal, macros, size = 190 }: { kcal: number; macros: MacroTargets; size?: number }) {
  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }); }, [progress, kcal]);
  const p = macros.proteinG * 4, c = macros.carbsG * 4, f = macros.fatG * 9;
  const total = p + c + f || 1;
  const stroke = 16;
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={(size - stroke) / 2} stroke="#DCE6E0" strokeWidth={stroke} fill="none" />
        <Arc size={size} stroke={stroke} start={0} frac={p / total} color={MACRO_COLORS.protein} progress={progress} />
        <Arc size={size} stroke={stroke} start={p / total} frac={c / total} color={MACRO_COLORS.carbs} progress={progress} />
        <Arc size={size} stroke={stroke} start={(p + c) / total} frac={f / total} color={MACRO_COLORS.fat} progress={progress} />
      </Svg>
      <Text className="text-4xl font-bold text-ink">{kcal.toLocaleString()}</Text>
      <Text className="text-sm text-ink/60">kcal per day</Text>
    </View>
  );
}
