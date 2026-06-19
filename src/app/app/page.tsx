import type { Metadata } from "next";
import { Shell } from "@/components/life-os/shell";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppPage() {
  return <Shell />;
}
