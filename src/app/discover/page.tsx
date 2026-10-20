import type { Metadata } from "next";
import { DiscoverScreen } from "@/components/DiscoverScreen";

export const metadata: Metadata = { title: "Discover — The Two of Us" };

export default function Page() {
  return <DiscoverScreen />;
}
