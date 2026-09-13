// RESET ERA — card export + real share sheet on mobile web, download fallback elsewhere
import type { ViewShotRef } from "react-native-view-shot";
import * as ViewShot from "react-native-view-shot";

export async function exportCard(
  ref: ViewShotRef | null,
  filename: string,
): Promise<"shared" | "saved" | string | null> {
  if (!ref) return null;
  try {
    const uri = await ViewShot.captureRef(ref, { format: "png", quality: 1 });
    const blob = await (await fetch(uri)).blob();

    // real share sheet (iOS/Android mobile web) — the TikTok-bio-link path
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Reset Era" });
          return "shared";
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return "shared"; // user closed the sheet
      }
    }

    if (typeof document !== "undefined") {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
      return "saved";
    }
    return uri;
  } catch {
    return null;
  }
}
