import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function Bar({ label, value, fraction, color, right }: { label: string; value: string; fraction: number; color: string; right?: string }) {
  const w = useSharedValue(0);
  useEffect(() => { w.value = withTiming(Math.min(Math.max(fraction, 0), 1), { duration: 700 }); }, [fraction, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View className="mb-3">
      <View className="mb-1 flex-row justify-between">
        <Text className="text-sm font-medium text-ink">{label}</Text>
        <Text className="text-sm text-ink/70">{value}{right ? `  ·  ${right}` : ''}</Text>
      </View>
      <View className="h-2.5 overflow-hidden rounded-full bg-pith">
        <Animated.View className="h-2.5 rounded-full" style={[{ backgroundColor: color }, style]} />
      </View>
    </View>
  );
}
