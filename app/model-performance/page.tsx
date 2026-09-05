"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getMetrics, ModelMetrics } from "@/lib/api";
import { BarChart2, Award, Cpu, ShieldCheck, CheckCircle2, TrendingUp, HelpCircle } from "lucide-react";

export default function ModelPerformancePage() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMetrics()
      .then((res) => {
        setMetrics(res);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans tech-grid-bg">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-600 mb-1">
              <BarChart2 className="w-4 h-4" />
              <span>TRANSPARENT EXPLAINABLE AI METRICS</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Model Performance Benchmark
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Cross-evaluated across 7 machine learning classification algorithms on 5,000 campus placement profiles.
            </p>
          </div>
        </div>

        {/* TOP HIGHLIGHT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="glass-panel p-5 rounded-2xl border border-indigo-200 bg-white/90 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-mono font-bold mb-1">
              <Award className="w-4 h-4" />
              <span>TOP ALGORITHM</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">Random Forest</div>
            <span className="text-[10px] text-slate-500 font-medium">Selected Production Model</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-200 bg-white/90 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-mono font-bold mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>ROC-AUC SCORE</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 font-mono">94.2%</div>
            <span className="text-[10px] text-slate-500 font-medium">Class Separation Quality</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-violet-200 bg-white/90 shadow-sm">
            <div className="flex items-center gap-2 text-violet-600 text-xs font-mono font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>CROSS-VALIDATION</span>
            </div>
            <div className="text-2xl font-black text-violet-600 font-mono">93.8%</div>
            <span className="text-[10px] text-slate-500 font-medium">5-Fold CV Accuracy Mean</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-blue-200 bg-white/90 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 text-xs font-mono font-bold mb-1">
              <Cpu className="w-4 h-4" />
              <span>EVALUATED PROFILES</span>
            </div>
            <div className="text-2xl font-black text-blue-600 font-mono">5,000</div>
            <span className="text-[10px] text-slate-500 font-medium">Standardized Dataset Records</span>
          </div>
        </div>

        {/* 7-MODEL LEADERBOARD TABLE */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200 bg-white/90 shadow-sm mb-10 overflow-hidden">
          <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            7-Algorithm Comparison Leaderboard
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-100/90 text-slate-700 font-mono font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Model Algorithm</th>
                  <th className="py-3 px-4">Test Accuracy</th>
                  <th className="py-3 px-4">Precision</th>
                  <th className="py-3 px-4">Recall</th>
                  <th className="py-3 px-4">F1 Score</th>
                  <th className="py-3 px-4">ROC-AUC</th>
                  <th className="py-3 px-4">5-Fold CV Mean</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 font-mono">
                {metrics?.comparison_table ? (
                  metrics.comparison_table.map((row, i) => {
                    const isTop = row.Model.includes("Random Forest");
                    return (
                      <tr
                        key={i}
                        className={`transition-colors ${
                          isTop ? "bg-indigo-50/70 border-l-4 border-l-indigo-600" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          {row.Model}
                          {isTop && (
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] border border-indigo-200 font-sans font-bold shadow-xs">
                              Production Model
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{(row.Accuracy * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{(row.Precision * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{(row.Recall * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{(row["F1 Score"] * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4 font-bold text-indigo-600">{(row["ROC-AUC"] * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{(row.CV_Accuracy_Mean * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      Loading benchmark leaderboard...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CONFUSION MATRIX & FEATURE IMPORTANCE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CONFUSION MATRIX (5 cols) */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Confusion Matrix (Test Split)
            </h3>

            {metrics?.confusion_matrix ? (
              <div className="grid grid-cols-2 gap-3 text-center font-mono my-4">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-wider block font-bold">True Positives (Placed)</span>
                  <span className="text-3xl font-black text-emerald-600">{metrics.confusion_matrix.TP}</span>
                </div>

                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] text-rose-800 uppercase tracking-wider block font-bold">False Positives</span>
                  <span className="text-3xl font-black text-rose-600">{metrics.confusion_matrix.FP}</span>
                </div>

                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] text-rose-800 uppercase tracking-wider block font-bold">False Negatives</span>
                  <span className="text-3xl font-black text-rose-600">{metrics.confusion_matrix.FN}</span>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-wider block font-bold">True Negatives (Not Placed)</span>
                  <span className="text-3xl font-black text-emerald-600">{metrics.confusion_matrix.TN}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Loading confusion matrix...</p>
            )}
          </div>

          {/* PERMUTATION FEATURE IMPORTANCE (7 cols) */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Top Permutation Feature Importance
            </h3>

            {metrics?.feature_importance ? (
              <div className="space-y-3 text-xs">
                {metrics.feature_importance.slice(0, 8).map((feat, i) => {
                  const maxVal = metrics.feature_importance[0].Importance;
                  const pct = Math.round((feat.Importance / maxVal) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-slate-800 font-mono">{feat.Feature}</span>
                        <span className="text-indigo-600 font-mono">{feat.Importance.toFixed(4)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Loading feature importance ranking...</p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
