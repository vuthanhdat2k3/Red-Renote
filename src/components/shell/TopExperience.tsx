import type { LucideIcon } from "lucide-react-native";
import type { PropsWithChildren, ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Text, View, type ColorValue, type StyleProp, type ViewStyle } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { colors, shadows } from "@/constants/tokens";

type TopExperienceProps = PropsWithChildren<{
  className?: string;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}>;

export function TopExperience({ children, className, style, delay = 0 }: TopExperienceProps) {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 320,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, entrance]);

  return (
    <Animated.View
      className={className}
      style={[
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
        shadows.card,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

type TopMetricProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  accent?: ColorValue;
  muted?: boolean;
  onPress?: () => void;
};

export function TopMetric({ accent = colors.blue, icon: Icon, label, muted, onPress, value }: TopMetricProps) {
  const content = (
    <View
      className="flex-1 gap-1 rounded-2xl px-3 py-3"
      style={{
        backgroundColor: "rgba(255,255,255,0.75)",
        borderColor: "rgba(255,255,255,0.9)",
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center gap-1.5 opacity-60">
        {Icon ? <Icon color={accent} size={12} strokeWidth={2.8} /> : null}
        <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text }}>
          {label}
        </Text>
      </View>
      <Text className="text-[20px] font-extrabold leading-6 tracking-tight" style={{ color: colors.text }}>
        {value}
      </Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <PressableScale accessibilityRole="button" className="flex-1" onPress={onPress} scaleTo={0.97}>
      {content}
    </PressableScale>
  );
}

type StatusPillProps = {
  children: ReactNode;
  icon?: LucideIcon;
  tone?: "blue" | "green" | "orange" | "red" | "neutral";
  onPress?: () => void;
};

const pillTones = {
  blue: { background: "rgba(37, 99, 235, 0.08)", color: colors.blue },
  green: { background: "rgba(20, 122, 77, 0.08)", color: colors.success },
  orange: { background: "rgba(180, 83, 9, 0.08)", color: colors.warning },
  red: { background: "rgba(255, 59, 48, 0.08)", color: colors.primary },
  neutral: { background: "rgba(255,255,255,0.8)", color: colors.secondaryText },
};

export function StatusPill({ children, icon: Icon, onPress, tone = "neutral" }: StatusPillProps) {
  const toneConfig = pillTones[tone];
  const content = (
    <View
      className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{ backgroundColor: toneConfig.background, borderColor: "rgba(255,255,255,0.5)", borderWidth: 1 }}
    >
      {Icon ? <Icon color={toneConfig.color} size={12} strokeWidth={2.6} /> : null}
      <Text className="text-[11px] font-bold" style={{ color: toneConfig.color }}>
        {children}
      </Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <PressableScale accessibilityRole="button" onPress={onPress} scaleTo={0.96}>
      {content}
    </PressableScale>
  );
}

type PulseDotProps = {
  active?: boolean;
  color?: string;
};

export function PulseDot({ active = true, color = colors.primary }: PulseDotProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => {
      animation.stop();
    };
  }, [active, pulse]);

  return (
    <View className="h-5 w-5 items-center justify-center">
      <Animated.View
        className="absolute h-5 w-5 rounded-full"
        style={{
          backgroundColor: color,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.14, 0.3] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.55] }) }],
        }}
      />
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    </View>
  );
}

type WaveformProps = {
  active?: boolean;
  metering?: number;
  bars?: number;
  color?: string;
};

export function Waveform({ active = true, bars = 20, color = "rgba(255,255,255,0.84)", metering = 0.65 }: WaveformProps) {
  const levels = useMemo(() => Array.from({ length: bars }, (_, index) => 12 + ((index * 17) % 44)), [bars]);

  return (
    <View className="h-16 flex-row items-center justify-center gap-1.5">
      {levels.map((level, index) => (
        <View
          className="w-1.5 rounded-full"
          key={`${level}-${index}`}
          style={{
            backgroundColor: color,
            height: 10 + level * metering,
            opacity: active ? 1 : 0.38,
          }}
        />
      ))}
    </View>
  );
}
