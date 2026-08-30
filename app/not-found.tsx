import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <div className="not-found"><span className="eyebrow">404 / no signal</span><h1>This route is not on the map.</h1><p>It may be private in this environment, or it may not exist.</p><Button asChild><Link href="/"><ArrowLeft aria-hidden="true" size={16} />Return home</Link></Button></div>;
}
