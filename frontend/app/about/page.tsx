"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Cpu, Code, Brain, BookOpen, Layers, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans tech-grid-bg">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-600 mb-1">
              <Layers className="w-4 h-4" />
              <span>SYSTEM SPECIFICATIONS & ARCHITECTURE</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Platform Methodology & System Design
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              A comprehensive breakdown of feature engineering, model pipeline, heuristic resume parsing, and decoupled REST backend architecture.
            </p>
          </div>
        </div>

        {/* SYSTEM ARCHITECTURE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Decoupled Backend Architecture */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 bg-white/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Decoupled Full-Stack Architecture</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              PlaceMint AI 2.0 separates presentation from inference logic. The Next.js frontend delivers glassmorphic, 60fps micro-animations via Framer Motion and GSAP, while a high-performance Python FastAPI server runs scikit-learn model predictions and PDF parsing.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-mono font-medium pt-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                Frontend: Next.js App Router (TypeScript, Tailwind CSS)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Backend REST API: Python FastAPI (Uvicorn)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                ML Pipeline: scikit-learn Random Forest Classifier
              </li>
            </ul>
          </div>

          {/* Composite Feature Engineering */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 bg-white/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Composite Feature Engineering</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Rather than relying solely on raw numbers, the custom <code className="text-indigo-600 font-mono font-bold bg-indigo-50 px-1.5 py-0.5 rounded">PlacementFeatureEngineer</code> computes 3 high-leverage composite signals during preprocessing:
            </p>
            <div className="space-y-2 text-xs font-mono bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200 shadow-inner">
              <p><span className="text-cyan-400">Academic Score:</span> (CGPA/10 * 50%) + (10th%/100 * 25%) + (12th%/100 * 25%)</p>
              <p><span className="text-emerald-400">Practical Score:</span> Min(100, Proj*8 + Intern*20 + Coding*12)</p>
              <p><span className="text-violet-400">Soft Skill Index:</span> Min(100, Comm * 16 * Extracurricular_Multiplier)</p>
            </div>
          </div>
        </div>

        {/* HEURISTIC RESUME PARSER BUGFIXES SUMMARY */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 bg-white/90 shadow-sm mb-12 space-y-4">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Core Bug Fixes & Reliability Enhancements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-indigo-600 mb-1">Regex Word Boundary Skill Parsing</h4>
              <p className="text-slate-600">
                Eliminated false positive single-letter matches ('C' and 'R') from normal words like "reading" or "cooking" by using word boundaries and programming context token matching.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-indigo-600 mb-1">Java & JavaScript Preservation</h4>
              <p className="text-slate-600">
                Fixed deduplication logic so that distinct languages like Java are preserved even when JavaScript is present on the resume.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-indigo-600 mb-1">Stream & Branch Detection</h4>
              <p className="text-slate-600">
                Extracted engineering disciplines (CSE, IT, ECE, ME, CE) directly from degree text and education entries.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-indigo-600 mb-1">Robust Phone Regex</h4>
              <p className="text-slate-600">
                Added support for spaced and hyphenated Indian phone numbers (+91 98765 43210).
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
