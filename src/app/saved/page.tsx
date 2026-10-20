import type { Metadata } from "next";
import { SavedScreen } from "@/components/SavedScreen";

export const metadata: Metadata = { title: "Saved conversations — The Two of Us" };

export default function Page() {
  return <SavedScreen />;
}
