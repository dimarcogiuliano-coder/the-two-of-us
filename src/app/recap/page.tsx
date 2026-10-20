import type { Metadata } from "next";
import { RecapScreen } from "@/components/RecapScreen";

export const metadata: Metadata = { title: "Tonight — The Two of Us" };

export default function Page() {
  return <RecapScreen />;
}
