import {
  Banknote,
  BedDouble,
  BookOpen,
  Beef,
  Droplets,
  Dumbbell,
  Footprints,
  Home,
  Moon,
  Move,
  PenLine,
  Phone,
  PhoneOff,
  Snowflake,
  Sparkles,
  StretchHorizontal,
  Sun,
  type LucideIcon,
} from "lucide-react-native";
import type { AnchorId } from "@/lib/plan";

export const ANCHOR_ICONS: Record<AnchorId, LucideIcon> = {
  phone: Phone,
  gym: Dumbbell,
  sleep: Moon,
  money: Banknote,
};

const SUPPORT_ICONS: [RegExp, LucideIcon][] = [
  [/water/i, Droplets],
  [/protein/i, Beef],
  [/sunlight/i, Sun],
  [/pages/i, BookOpen],
  [/cold/i, Snowflake],
  [/room/i, Home],
  [/journal/i, PenLine],
  [/stretch/i, StretchHorizontal],
  [/no-phone/i, PhoneOff],
  [/bed made/i, BedDouble],
  [/step/i, Footprints],
];

export function supportIcon(title: string): LucideIcon {
  for (const [re, icon] of SUPPORT_ICONS) {
    if (re.test(title)) return icon;
  }
  return Sparkles;
}

export function anchorQuestIcon(anchor: AnchorId, title: string): LucideIcon {
  if (/step/i.test(title)) return Footprints;
  if (/out of bedroom/i.test(title)) return PhoneOff;
  if (/wake/i.test(title)) return Sun;
  if (/spend report/i.test(title)) return PenLine;
  return ANCHOR_ICONS[anchor];
}
