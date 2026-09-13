// Minimal monochrome system — icon/prop colors (non-Tailwind contexts).
// All neutrals; hierarchy comes from opacity, not hue.
export const c = {
  ink: "hsl(240 15% 5%)",
  surface: "hsl(240 15% 9%)",
  line: "hsl(240 11% 17%)",
  fg: "hsl(0 0% 96%)",
  mid: "hsl(0 0% 72%)",
  muted: "hsl(0 0% 58%)",
  dim: "hsl(0 0% 40%)",
  glow: "hsl(0 0% 96%)",
} as const;
