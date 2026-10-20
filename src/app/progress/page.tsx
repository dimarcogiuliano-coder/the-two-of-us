import type { Metadata } from "next";
import { ProgressScreen } from "@/components/ProgressScreen";

export const metadata: Metadata = { title: "Our Progress — The Two of Us" };

export default function Page() {
  return <ProgressScreen />;
}
