"use client";
import dynamic from "next/dynamic";
const Viewer = dynamic(() => import("../components/viewer/index"), { ssr: false });

export default function ClientApp() {
  return <Viewer />;
}
