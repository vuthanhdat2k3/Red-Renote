export const colors = {
  primary: "#E50914",
  darkRed: "#8B0000",
  softRed: "#FF6B6B",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#111111",
  secondaryText: "#6B7280",
  border: "#E5E7EB",
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
  md: 12,
  lg: 16,
  xl: 24,
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  redGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 5,
  },
} as const;
