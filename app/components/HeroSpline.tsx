"use client";

import dynamic from "next/dynamic";

const SCENE_URL = "https://prod.spline.design/lHsUKP1cIQYRkBAz/scene.splinecode";

const Spline = dynamic(
  () => import("@splinetool/react-spline").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-100 sm:rounded-3xl"
        aria-hidden
      >
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-300" />
      </div>
    ),
  }
);

export function HeroSpline() {
  return (
    <div className="relative w-full aspect-[4/3] min-h-[240px] overflow-hidden rounded-2xl shadow-lg sm:min-h-[280px] sm:rounded-3xl lg:min-h-[320px]">
      <Spline scene={SCENE_URL} className="h-full w-full" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
