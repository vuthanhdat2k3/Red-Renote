import { Mic, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors, radius, shadows } from "@/constants/tokens";

type BrandMarkProps = {
  compact?: boolean;
  inverted?: boolean;
};

export function BrandMark({ compact = false, inverted = false }: BrandMarkProps) {
  const tileSize = compact ? 28 : 74;
  const iconSize = compact ? 13 : 30;
  const sparklesSize = compact ? 10 : 16;
  const tileBackground = compact
    ? "#FFF1F0"
    : inverted
      ? "rgba(255,255,255,0.12)"
      : "rgba(255,255,255,0.08)";
  const tileBorderColor = compact ? "#F1C4BF" : "rgba(255,255,255,0.15)";

  return (
    <View className={compact ? "flex-row items-center gap-2" : "items-center gap-5"}>
      <View
        className="items-center justify-center"
        style={{
          width: tileSize,
          height: tileSize,
          borderRadius: compact ? 10 : radius.xl,
          backgroundColor: tileBackground,
          borderWidth: 1,
          borderColor: tileBorderColor,
          ...(compact ? {} : shadows.redGlow),
        }}
      >
        <Mic
          color={inverted ? colors.surface : colors.primary}
          size={iconSize}
          strokeWidth={2.6}
        />
        <View className="absolute right-1 top-1 rounded-full bg-white/80 p-[2px]">
          <Sparkles
            color={inverted ? colors.primary : colors.softRed}
            size={sparklesSize}
            strokeWidth={2.5}
          />
        </View>
      </View>

      <View className={compact ? "gap-0" : "items-center gap-1"}>
        <Text
          className={compact ? "text-[10px] font-bold tracking-[2px]" : "text-[20px] font-bold"}
          style={{ color: inverted ? colors.surface : colors.text }}
        >
          RED RENOTE
        </Text>
        {!compact ? (
          <Text className="text-sm" style={{ color: "rgba(255,255,255,0.82)" }}>
            Record. Recall. Reason.
          </Text>
        ) : null}
      </View>
    </View>
  );
}
