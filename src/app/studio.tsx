import { useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import ViewShot, { type ViewShotRef } from "react-native-view-shot";
import { ChevronLeft, ChevronRight, Download } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { SLIDES, SlideView, SLIDE_H, SLIDE_W } from "@/components/slides";
import { tap } from "@/lib/haptics";

const PREVIEW_W = 300;
const SCALE = PREVIEW_W / SLIDE_W;

export default function Studio() {
  const refs = useRef<(ViewShotRef | null)[]>(SLIDES.map(() => null));
  const [saving, setSaving] = useState<number | "all" | null>(null);

  const saveOne = async (i: number): Promise<boolean> => {
    try {
      const uri = await (refs.current[i] as ViewShotRef).capture();
      if (typeof document === "undefined") return false;
      const blob = await (await fetch(uri)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reset-era-slide-${String(i + 1).padStart(2, "0")}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
      return true;
    } catch {
      return false;
    }
  };

  const saveAll = async () => {
    setSaving("all");
    for (let i = 0; i < SLIDES.length; i++) {
      setSaving(i);
      await saveOne(i);
      await new Promise((r) => setTimeout(r, 700));
    }
    setSaving(null);
  };

  const [current, setCurrent] = useState(0);

  return (
    <ScrollView contentContainerClassName="min-h-full items-center bg-background px-5 pb-20 pt-14 pt-safe">
      <Text className="mb-1 font-display text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
        Content studio
      </Text>
      <Text className="mb-6 text-center font-body text-[13px] text-muted-foreground">
        Hero carousel · 9 slides · 1080×1350 · TikTok photo mode
      </Text>

      {/* preview of current slide */}
      <View
        style={{ width: PREVIEW_W, height: PREVIEW_W / (SLIDE_W / SLIDE_H) }}
        className="overflow-hidden rounded-xl border border-border"
      >
        <View style={{ width: SLIDE_W, height: SLIDE_H, transform: [{ scale: SCALE }], transformOrigin: "top left" }}>
          <SlideView slide={SLIDES[current]} />
        </View>
      </View>

      {/* stepper */}
      <View className="mt-4 w-full flex-row items-center justify-between">
        <Pressable
          onPress={() => {
            tap();
            setCurrent(Math.max(0, current - 1));
          }}
          className="h-10 w-10 items-center justify-center rounded-lg border border-border bg-card"
        >
          <ChevronLeft size={18} color="hsl(0 0% 72%)" />
        </Pressable>
        <View className="flex-row gap-1.5">
          {SLIDES.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => setCurrent(i)}
              className={`h-1.5 w-6 rounded-full ${i === current ? "bg-foreground" : "bg-secondary"}`}
            />
          ))}
        </View>
        <Pressable
          onPress={() => {
            tap();
            setCurrent(Math.min(SLIDES.length - 1, current + 1));
          }}
          className="h-10 w-10 items-center justify-center rounded-lg border border-border bg-card"
        >
          <ChevronRight size={18} color="hsl(0 0% 72%)" />
        </Pressable>
      </View>

      <Pressable
        onPress={saveAll}
        disabled={saving !== null}
        className={`mt-5 h-12 w-full flex-row items-center justify-center rounded-lg ${
          saving !== null ? "bg-secondary" : "bg-foreground"
        }`}
      >
        <Download size={16} color="hsl(240 15% 6%)" />
        <Text className="ml-2 font-bodyBold text-[14px] text-background">
          {saving === "all"
            ? "Saving all 9…"
            : typeof saving === "number"
              ? `Saving slide ${saving + 1}…`
              : "Save all 9 slides"}
        </Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          tap();
          await saveOne(current);
        }}
        className="mt-3 h-11 w-full items-center justify-center rounded-lg border border-border bg-card"
      >
        <Text className="font-bodyMedium text-[13px] text-foreground">
          Save current slide ({current + 1})
        </Text>
      </Pressable>

      {/* hidden full-res capture targets */}
      <View className="absolute" style={{ left: -99999, top: 0 }}>
        {SLIDES.map((s, i) => (
          <ViewShot key={i} ref={(r) => { refs.current[i] = r; }} options={{ format: "png", quality: 1 }}>
            <SlideView slide={s} />
          </ViewShot>
        ))}
      </View>
    </ScrollView>
  );
}
