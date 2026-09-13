import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { track } from "@/lib/analytics";
import {
  ANCHORS,
  INTENSITY_COPY,
  TONE_PACKS,
  makeHook,
  makePlanName,
  type AnchorId,
  type Intensity,
  type TonePackId,
} from "@/lib/plan";
import { useEra } from "@/lib/store";

const WAKE_PRESETS = ["05:30", "06:00", "06:30", "07:00", "08:00", "09:00", "10:00", "11:00"];
const IDENTITY_CHIPS = [
  "shows up every day",
  "is disciplined with money",
  "trains 4x a week",
  "fixed his sleep",
  "doesn't scroll all day",
  "is unrecognizable",
];

export default function Quiz() {
  const router = useRouter();
  const setProfile = useEra((s) => s.setProfile);
  const [step, setStep] = useState(0);
  const [tone, setTone] = useState<TonePackId | null>(null);
  const [anchor, setAnchor] = useState<AnchorId | null>(null);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [wakeTime, setWakeTime] = useState<string | null>(null);
  const [identity, setIdentity] = useState("");

  const canNext = [tone, anchor, intensity, wakeTime, identity.trim().length > 0][step] != null &&
    (step !== 4 || identity.trim().length > 0);

  const finish = () => {
    const t = tone!;
    const a = anchor!;
    const i = intensity!;
    const id = identity.trim();
    setProfile({
      tone: t,
      anchor: a,
      intensity: i,
      wakeTime: wakeTime!,
      identity: id,
      planName: makePlanName(id, t),
      hook: makeHook(id),
      alias: "",
      startedAt: Date.now(),
      comebackDone: 0,
    });
    track("quiz_completed", { tone: t, anchor: a, intensity: i });
    track("plan_created", { plan: makePlanName(id, t) });
    router.replace("/pledge");
  };

  return (
    <ScrollView
      className="flex-1 bg-ink"
      contentContainerClassName="min-h-full px-6 pb-16 pt-20"
    >
      <View className="mb-8">
        <Text className="text-xs font-semibold uppercase tracking-[0.3em] text-ember">
          Reset Era
        </Text>
        <View className="mt-3 h-1 w-full flex-row rounded bg-line">
          <View
            className="h-1 rounded bg-ember"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </View>
      </View>

      {step === 0 && (
        <Question q="What dragged you here?">
          {(Object.keys(TONE_PACKS) as TonePackId[]).map((k) => (
            <Option
              key={k}
              label={TONE_PACKS[k].label}
              sub={TONE_PACKS[k].blurb}
              selected={tone === k}
              onPress={() => setTone(k)}
            />
          ))}
        </Question>
      )}

      {step === 1 && (
        <Question q="Your #1 enemy right now?">
          {(Object.keys(ANCHORS) as AnchorId[]).map((k) => (
            <Option
              key={k}
              label={ANCHORS[k].label}
              sub={`vs ${ANCHORS[k].enemy}`}
              selected={anchor === k}
              onPress={() => setAnchor(k)}
            />
          ))}
        </Question>
      )}

      {step === 2 && (
        <Question q="How much time can you actually give this daily?">
          {([15, 30, 60] as Intensity[]).map((m) => (
            <Option
              key={m}
              label={m === 60 ? "60+ minutes" : `${m} minutes`}
              sub={INTENSITY_COPY[m]}
              selected={intensity === m}
              onPress={() => setIntensity(m)}
            />
          ))}
        </Question>
      )}

      {step === 3 && (
        <Question q="When does your day start?">
          <View className="flex-row flex-wrap gap-3">
            {WAKE_PRESETS.map((t) => (
              <Chip key={t} label={t} selected={wakeTime === t} onPress={() => setWakeTime(t)} />
            ))}
          </View>
        </Question>
      )}

      {step === 4 && (
        <Question q="What does 'him' look like on Day 30?">
          <View className="mb-4 flex-row flex-wrap gap-3">
            {IDENTITY_CHIPS.map((c) => (
              <Chip key={c} label={c} selected={identity === c} onPress={() => setIdentity(c)} />
            ))}
          </View>
          <TextInput
            value={identity}
            onChangeText={setIdentity}
            placeholder="or type it — finish the sentence: 'He…'"
            placeholderTextColor="#5A5A66"
            multiline
            className="rounded-xl border border-line bg-panel p-4 text-base text-white"
          />
        </Question>
      )}

      <View className="mt-10 flex-row justify-between">
        {step > 0 ? (
          <Pressable onPress={() => setStep(step - 1)} className="py-4">
            <Text className="text-zinc-500">Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable
          disabled={!canNext}
          onPress={() => (step < 4 ? setStep(step + 1) : finish())}
          className={`rounded-xl px-8 py-4 ${canNext ? "bg-ember" : "bg-line opacity-40"}`}
        >
          <Text className="text-base font-bold text-white">
            {step < 4 ? "Next" : "Lock in"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Question({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="mb-6 text-3xl font-bold leading-tight text-white">{q}</Text>
      <View className="gap-3">{children}</View>
    </View>
  );
}

function Option({
  label,
  sub,
  selected,
  onPress,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl border p-4 ${
        selected ? "border-ember bg-panel" : "border-line bg-panel/60"
      }`}
    >
      <Text className="text-lg font-semibold text-white">{label}</Text>
      <Text className="mt-1 text-sm text-zinc-400">{sub}</Text>
    </Pressable>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-3 ${
        selected ? "border-ember bg-ember/20" : "border-line bg-panel/60"
      }`}
    >
      <Text className="text-sm text-white">{label}</Text>
    </Pressable>
  );
}
