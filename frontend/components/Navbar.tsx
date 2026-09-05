"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getHealth } from "@/lib/api";
import { Brain, Sparkles, Activity } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<{ status: string; model_ready: boolean } | null>(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth({ status: "offline", model_ready: false }));
    const interval = setInterval(() => {
      getHealth().then(setHealth).catch(() => setHealth({ status: "offline", model_ready: false }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Predictor", href: "/predict" },
    { label: "Resume Analyzer", href: "/resume-analyzer" },
    { label: "Model Metrics", href: "/model-performance" },
    { label: "Architecture", href: "/about" },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 mb-6">
      <div className="max-w-7xl mx-auto h-16 px-6 rounded-full backdrop-blur-xl bg-white/85 border border-slate-200/90 shadow-lg shadow-slate-200/50 flex items-center justify-between gap-4">
        {/* Left Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              PlaceMint
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              AI 2.0
            </span>
          </div>
        </Link>

        {/* Center Pill Nav Bar (Matches Screenshot) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button Pill (Matches Screenshot "Hire Me" pill style) */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  health?.status === "ok" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  health?.status === "ok" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>
            <span className="text-slate-700 font-semibold">
              {health?.status === "ok" ? "Engine Online" : "Connecting"}
            </span>
          </div>

          <Link
            href="/predict"
            className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-xs shadow-md shadow-slate-900/10 hover:shadow-indigo-500/25 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Predictor</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
