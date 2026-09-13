// RESET ERA content studio — spec §7 hero carousel, rendered from the app design system.
// 9 slides: S1 hook · S2-8 the 7 rules · S9 app reveal. 1080×1350 export.
import { Flame } from "lucide-react-native";
import { Text, View } from "react-native";
import { c } from "@/lib/colors";

export interface Slide {
  eyebrow: string;
  lines: string[];
  sub?: string;
  reveal?: boolean;
}

export const SLIDES: Slide[] = [
  {
    eyebrow: "THE GREAT LOCK-IN",
    lines: ["The Great Lock-In", "ends Dec 31.", "You're 40%", "through."],
    sub: "Most of you already quit.",
  },
  { eyebrow: "RULE 01 / 07", lines: ["Three quests", "a day.", "Non-negotiable."] },
  {
    eyebrow: "RULE 02 / 07",
    lines: ["The phone", "charges outside", "the bedroom."],
  },
  {
    eyebrow: "RULE 03 / 07",
    lines: ["Train when you", "don't feel like it.", "That's the", "whole trick."],
  },
  { eyebrow: "RULE 04 / 07", lines: ["Sleep is a", "schedule,", "not a mood."] },
  {
    eyebrow: "RULE 05 / 07",
    lines: ["No-spend days.", "Discipline hits", "your wallet too."],
  },
  {
    eyebrow: "RULE 06 / 07",
    lines: ["Missed a day?", "One quest.", "The arc", "continues."],
  },
  {
    eyebrow: "RULE 07 / 07",
    lines: ["Tell nobody.", "Let the stats", "talk at Day 30."],
  },
  {
    eyebrow: "THE GREAT LOCK-IN",
    lines: ["I built the app", "that runs this."],
    sub: "Quests · a momentum score · a stat card that proves it. Link in bio.",
    reveal: true,
  },
];

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;

export function SlideView({ slide }: { slide: Slide }) {
  return (
    <View
      style={{
        width: SLIDE_W,
        height: SLIDE_H,
        backgroundColor: c.ink,
        paddingTop: 96,
        paddingBottom: 88,
        paddingHorizontal: 96,
        justifyContent: "space-between",
      }}
    >
      {/* header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Flame size={30} color={c.fg} />
        <Text
          style={{
            fontFamily: "SpaceGrotesk_500Medium",
            fontSize: 27,
            letterSpacing: 7,
            textTransform: "uppercase",
            color: c.muted,
          }}
        >
          {slide.eyebrow}
        </Text>
      </View>

      {/* statement */}
      <View>
        {slide.lines.map((l, i) => (
          <Text
            key={i}
            style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: slide.lines.length > 3 ? 92 : 104,
              lineHeight: slide.lines.length > 3 ? 104 : 118,
              color: i === slide.lines.length - 1 && !slide.reveal ? c.mid : c.fg,
              marginBottom: 8,
            }}
          >
            {l}
          </Text>
        ))}
        {slide.sub && (
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: slide.reveal ? 34 : 40,
              lineHeight: slide.reveal ? 46 : 52,
              color: slide.reveal ? c.mid : c.dim,
              marginTop: 36,
              maxWidth: 820,
            }}
          >
            {slide.sub}
          </Text>
        )}
      </View>

      {/* footer */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderTopWidth: 1,
          borderTopColor: c.line,
          paddingTop: 34,
        }}
      >
        <Text
          style={{
            fontFamily: "SpaceGrotesk_500Medium",
            fontSize: 23,
            letterSpacing: 9,
            textTransform: "uppercase",
            color: c.dim,
          }}
        >
          {slide.reveal ? "reset era" : "reset era · 7-day reset"}
        </Text>
        <Text
          style={{
            fontFamily: "SpaceGrotesk_500Medium",
            fontSize: 23,
            letterSpacing: 5,
            color: c.dim,
          }}
        >
          {slide.reveal ? "link in bio" : "great lock-in '26"}
        </Text>
      </View>
    </View>
  );
}
