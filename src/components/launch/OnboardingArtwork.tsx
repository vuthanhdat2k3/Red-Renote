import { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop, Svg } from "react-native-svg";
import { View } from "react-native";

import { colors, radius, shadows } from "@/constants/tokens";

function Person({
  x,
  y,
  scale = 1,
  accent = "#4B5563",
}: {
  x: number;
  y: number;
  scale?: number;
  accent?: string;
}) {
  return (
    <>
      <Circle cx={x} cy={y} fill="#D9C7B5" r={18 * scale} />
      <Path
        d={`M ${x - 24 * scale} ${y + 24 * scale} C ${x - 18 * scale} ${y + 2 * scale}, ${x + 18 * scale} ${y + 2 * scale}, ${x + 24 * scale} ${y + 24 * scale} L ${x + 36 * scale} ${y + 88 * scale} L ${x - 36 * scale} ${y + 88 * scale} Z`}
        fill={accent}
      />
    </>
  );
}

export function OnboardingArtwork() {
  return (
    <View
      className="overflow-hidden self-stretch"
      style={{
        aspectRatio: 1,
        borderRadius: radius.xl + 4,
        backgroundColor: "#1B1E22",
        ...shadows.card,
      }}
    >
      <Svg height="100%" viewBox="0 0 320 320" width="100%">
        <Defs>
          <LinearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <Stop offset="0" stopColor="#15181C" />
            <Stop offset="1" stopColor="#30353B" />
          </LinearGradient>
          <LinearGradient id="glow" x1="0" x2="1">
            <Stop offset="0" stopColor="#E50914" stopOpacity="0.12" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.06" />
          </LinearGradient>
        </Defs>

        <Rect fill="url(#bg)" height="320" width="320" />
        <Ellipse cx="160" cy="72" fill="#84939F" opacity="0.35" rx="88" ry="56" />
        <Ellipse cx="160" cy="58" fill="url(#glow)" rx="110" ry="70" />

        <Circle cx="160" cy="86" fill="#D8C6B4" r="46" />
        <Path d="M130 83 C 138 36, 183 36, 191 83 L 191 116 L 130 116 Z" fill="#2B2C31" />
        <Path d="M112 144 C 122 108, 198 108, 208 144 L 224 236 L 96 236 Z" fill="#1F2125" />

        <Person accent="#363A40" scale={0.86} x={62} y={160} />
        <Person accent="#363A40" scale={0.86} x={258} y={160} />

        <Rect fill="#2C231E" height="36" width="320" y="244" />
        <Rect fill="#211914" height="40" width="320" y="280" />
        <Rect fill={colors.softRed} height="3" opacity="0.18" rx="1.5" width="126" x="97" y="254" />
      </Svg>
    </View>
  );
}
