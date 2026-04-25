export const colors = {
  primary: "#FF3B30",
  darkRed: "#8B0000",
  softRed: "#FF6A3D",
  blue: "#2563EB",
  softBlue: "#EFF6FF",
  softGreen: "#ECFDF3",
  softOrange: "#FFF7ED",
  background: "#F7F7F8",
  surface: "#FFFFFF",
  text: "#111111",
  secondaryText: "#656B76",
  border: "#E6E8EC",
  success: "#147A4D",
  warning: "#B45309",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  screen: 20,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "400",
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
} as const;

export const shadows = {
  card: {
    shadowColor: "#111111",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  redGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
} as const;
