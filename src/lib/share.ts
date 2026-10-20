import { SITE_NAME, TAGLINE } from "./site";

/** Copy text to the clipboard, with a fallback for older in-app browsers. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** The public homepage URL — never includes game state. */
export function homeUrl(): string {
  return `${window.location.origin}/`;
}

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

export async function shareApp(text = `${SITE_NAME} — ${TAGLINE}`): Promise<ShareResult> {
  const url = homeUrl();
  const data = { title: SITE_NAME, text, url };
  if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data))) {
    try {
      await navigator.share(data);
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      // Otherwise fall back to copying.
    }
  }
  return (await copyText(url)) ? "copied" : "failed";
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
