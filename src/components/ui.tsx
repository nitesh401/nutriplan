import React, { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { type Control, type FieldValues, type Path, useController } from 'react-hook-form';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`rounded-2xl border border-pith bg-white p-4 ${className}`}>{children}</View>;
}

export function Button({ title, onPress, variant = 'primary' }: { title: string; onPress: () => void; variant?: 'primary' | 'quiet' }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`items-center rounded-xl px-5 py-3.5 active:opacity-80 ${variant === 'primary' ? 'bg-leaf' : 'bg-pith'}`}
    >
      <Text className={`text-base font-semibold ${variant === 'primary' ? 'text-white' : 'text-ink'}`}>{title}</Text>
    </Pressable>
  );
}

export function StepFooter({ onBack, onNext, nextLabel = 'Continue' }: { onBack?: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <View className="mt-6 flex-row gap-3">
      {onBack && <View className="flex-1"><Button title="Back" variant="quiet" onPress={onBack} /></View>}
      <View className="flex-[2]"><Button title={nextLabel} onPress={onNext} /></View>
    </View>
  );
}

function Shell({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="mb-1.5 text-sm font-semibold text-ink">{label}</Text>
      {children}
      {hint && !error && <Text className="mt-1 text-xs text-ink/60">{hint}</Text>}
      {error && <Text className="mt-1 text-xs text-warn">{error}</Text>}
    </View>
  );
}

type FP<T extends FieldValues> = { control: Control<T>; name: Path<T>; label: string; hint?: string };

export function TextField<T extends FieldValues>({ control, name, label, hint }: FP<T>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Shell label={label} hint={hint} error={fieldState.error?.message}>
      <TextInput
        className="rounded-xl border border-pith bg-white px-3 py-3 text-base text-ink"
        value={(field.value as string | undefined) ?? ''}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        autoCapitalize="words"
      />
    </Shell>
  );
}

export function NumberField<T extends FieldValues>({ control, name, label, hint, unit }: FP<T> & { unit?: string }) {
  const { field, fieldState } = useController({ control, name });
  const [text, setText] = useState(field.value == null ? '' : String(field.value));
  return (
    <Shell label={label} hint={hint} error={fieldState.error?.message}>
      <View className="flex-row items-center rounded-xl border border-pith bg-white px-3">
        <TextInput
          className="flex-1 py-3 text-base text-ink"
          keyboardType="decimal-pad"
          value={text}
          onBlur={field.onBlur}
          onChangeText={(t) => {
            const c = t.replace(',', '.');
            if (!/^\d*\.?\d*$/.test(c)) return;
            setText(c);
            field.onChange(c === '' || c === '.' ? undefined : Number(c));
          }}
        />
        {unit && <Text className="text-sm text-ink/60">{unit}</Text>}
      </View>
    </Shell>
  );
}

type Opt<V> = { value: V; label: string; description?: string };

export function ChipsField<T extends FieldValues, V extends string | number>({ control, name, label, hint, options }: FP<T> & { options: Opt<V>[] }) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Shell label={label} hint={hint} error={fieldState.error?.message}>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => {
          const on = field.value === o.value;
          return (
            <Pressable key={String(o.value)} onPress={() => field.onChange(o.value)} accessibilityState={{ selected: on }}
              className={`rounded-full border px-4 py-2 ${on ? 'border-leaf bg-leaf' : 'border-pith bg-white'}`}>
              <Text className={`text-sm font-medium ${on ? 'text-white' : 'text-ink'}`}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Shell>
  );
}

export function MultiChipsField<T extends FieldValues, V extends string>({ control, name, label, hint, options }: FP<T> & { options: Opt<V>[] }) {
  const { field, fieldState } = useController({ control, name });
  const value = (field.value ?? []) as V[];
  return (
    <Shell label={label} hint={hint} error={fieldState.error?.message}>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <Pressable key={o.value} onPress={() => field.onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
              accessibilityState={{ checked: on }}
              className={`rounded-full border px-4 py-2 ${on ? 'border-berry bg-berry' : 'border-pith bg-white'}`}>
              <Text className={`text-sm font-medium ${on ? 'text-white' : 'text-ink'}`}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Shell>
  );
}

export function ChoiceField<T extends FieldValues, V extends string>({ control, name, label, options }: FP<T> & { options: Opt<V>[] }) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Shell label={label} error={fieldState.error?.message}>
      <View className="gap-2">
        {options.map((o) => {
          const on = field.value === o.value;
          return (
            <Pressable key={o.value} onPress={() => field.onChange(o.value)} accessibilityState={{ selected: on }}
              className={`rounded-xl border p-3 ${on ? 'border-leaf bg-pith' : 'border-pith bg-white'}`}>
              <Text className="text-base font-semibold text-ink">{o.label}</Text>
              {o.description && <Text className="mt-0.5 text-sm text-ink/70">{o.description}</Text>}
            </Pressable>
          );
        })}
      </View>
    </Shell>
  );
}

export function ToggleField<T extends FieldValues>({ control, name, label, hint }: FP<T>) {
  const { field } = useController({ control, name });
  return (
    <View className="mb-5 flex-row items-center justify-between gap-4">
      <View className="flex-1">
        <Text className="text-sm font-semibold text-ink">{label}</Text>
        {hint && <Text className="mt-0.5 text-xs text-ink/60">{hint}</Text>}
      </View>
      <Switch value={Boolean(field.value)} onValueChange={field.onChange} trackColor={{ true: '#2E7D55' }} />
    </View>
  );
}
