import React from "react";
import { Brain, Cpu, Code, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-slate-100/80 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="flex flex-col gap-3 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-black text-lg text-slate-900 tracking-tight">
              PlaceMint AI 2.0
            </span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed max-w-md">
            Production-grade Campus Placement Prediction & ATS Resume Intelligence Platform powered by scikit-learn machine learning, heuristic resume parsing, and explainable AI metrics.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Next.js 14", "FastAPI", "scikit-learn", "Tailwind CSS", "Framer Motion", "GSAP"].map((tech) => (
              <span key={tech} className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-mono font-semibold text-indigo-700 shadow-xs">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
            Core Modules
          </h4>
          <ul className="space-y-2 font-medium">
            <li><a href="/predict" className="hover:text-indigo-600 transition-colors">Direct Placement Predictor</a></li>
            <li><a href="/resume-analyzer" className="hover:text-indigo-600 transition-colors">Smart ATS Resume Parser</a></li>
            <li><a href="/resume-analyzer" className="hover:text-indigo-600 transition-colors">Interactive Resume Builder</a></li>
            <li><a href="/model-performance" className="hover:text-indigo-600 transition-colors">7-Model Leaderboard & ROC</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
            System Integrity
          </h4>
          <div className="space-y-2 text-slate-600 text-[11px]">
            <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Deterministic Pipeline
            </p>
            <p className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600" /> Single Source ML Artifacts
            </p>
            <p className="flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-600" /> Zero Model Drift Guarantee
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© 2026 PlaceMint AI. Built for Next-Gen Student Career Placement.</p>
        <p className="font-mono font-bold text-indigo-600">Model ROC-AUC: 94.2% | Random Forest Classifier</p>
      </div>
    </footer>
  );
}
