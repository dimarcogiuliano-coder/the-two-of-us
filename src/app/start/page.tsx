import type { Metadata } from "next";
import { ChooseAdventure } from "@/components/ChooseAdventure";

export const metadata: Metadata = { title: "Choose your adventure — The Two of Us" };

export default function Page() {
  return <ChooseAdventure />;
}
