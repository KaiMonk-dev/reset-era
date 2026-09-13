// RESET ERA — stat-card PNG export (web: download/share; native: view-shot share)
import type { ViewShotRef } from "react-native-view-shot";
import * as ViewShot from "react-native-view-shot";

export async function exportCard(ref: ViewShotRef | null, filename: string): Promise<string | null> {
  if (!ref) return null;
  try {
    const uri = await ViewShot.captureRef(ref, { format: "png", quality: 1 });
    if (typeof document !== "undefined") {
      const blob = await (await fetch(uri)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
      return url;
    }
    return uri;
  } catch {
    return null;
  }
}
