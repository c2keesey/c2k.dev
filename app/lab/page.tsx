import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeatureLab } from "@/components/feature-lab";
import { isPrivateEnvironment } from "@/lib/env";

export const metadata: Metadata = { title: "Feature Lab", robots: { index: false, follow: false } };

export default function LabPage() {
  if (!isPrivateEnvironment()) notFound();
  return <div className="page-shell"><FeatureLab /></div>;
}
