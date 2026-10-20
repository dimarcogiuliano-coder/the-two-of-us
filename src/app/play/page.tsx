import type { Metadata } from "next";
import { PlayScreen } from "@/components/PlayScreen";

export const metadata: Metadata = { title: "Play — The Two of Us" };

export default function Page() {
  return <PlayScreen />;
}
