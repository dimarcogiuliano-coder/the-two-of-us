import type { Metadata } from "next";
import { TogetherScreen } from "@/components/TogetherScreen";

export const metadata: Metadata = { title: "Together — The Two of Us" };

export default function Page() {
  return <TogetherScreen />;
}
