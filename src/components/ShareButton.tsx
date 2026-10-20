"use client";

import { Share2 } from "lucide-react";
import { shareApp } from "@/lib/share";
import { showToast } from "./Toast";

export async function shareWithFeedback() {
  const result = await shareApp();
  if (result === "copied") showToast("Link copied — send it to someone");
  if (result === "failed") showToast("Couldn’t share. Copy the address bar instead.");
}

export function ShareButton({ variant = "ghost" }: { variant?: "ghost" | "secondary" }) {
  return (
    <button
      type="button"
      className={variant === "secondary" ? "btn-secondary" : "btn-ghost"}
      onClick={shareWithFeedback}
    >
      <Share2 className="size-4" aria-hidden /> Share The Two of Us
    </button>
  );
}
