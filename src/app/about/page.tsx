import type { Metadata } from "next";
import { AboutScreen } from "@/components/AboutScreen";

export const metadata: Metadata = { title: "About — The Two of Us" };

export default function Page() {
  return <AboutScreen />;
}
