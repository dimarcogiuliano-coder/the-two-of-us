import type { Metadata } from "next";
import { SettingsScreen } from "@/components/SettingsScreen";

export const metadata: Metadata = { title: "Settings — The Two of Us" };

export default function Page() {
  return <SettingsScreen />;
}
