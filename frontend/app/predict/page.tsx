"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Gauge } from "@/components/Gauge";
import { getConfig, predictPlacement, PredictionResult } from "@/lib/api";
import {
  Brain,
  Sparkles,
  Sliders,
  Award,
  BookOpen,
  Code,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function PredictPage() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const initialFeatures = {
    cgpa: 8.2,
    tenth_percentage: 78.5,
    twelfth_percentage: 76.0,
    backlogs: 0,
    study_hours_per_day: 4,
    attendance_percentage: 82.0,
    projects_completed: 5,
    internships_completed: 1,
    coding_skill_rating: 4,
    communication_skill_rating: 4,
    aptitude_skill_rating: 3,
    hackathons_participated: 2,
    certifications_count: 2,
    sleep_hours: 7,
    stress_level: 5,
    gender: "Male",
    branch: "CSE",
    part_time_job: "No",
    family_income_level: "Medium",
    city_tier: "Tier 2",
    internet_access: "Yes",
    extracurricular_involvement: "Medium",
  };

  const [features, setFeatures] = useState<Record<string, any>>(initialFeatures);
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    getConfig().then((res) => {
      if (res?.config) {
        setConfig(res.config);
      }
    });
    // Trigger initial prediction once on page load
    handlePredict(initialFeatures);
  }, []);

  // Update slider state ONLY -- do NOT calculate prediction until user clicks Recalculate button
  const updateFeature = (key: string, val: any) => {
    setFeatures((prev) => ({ ...prev, [key]: val }));
  };

  const handlePredict = async (currentFeatures = features) => {
    setLoading(true);
    try {
      const res = await predictPlacement(currentFeatures);
      setResult(res);

      if (res.placed_probability >= 0.7) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#4f46e5", "#059669", "#0891b2"],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans tech-grid-bg">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-600 mb-1">
              <Sliders className="w-4 h-4" />
              <span>INTERACTIVE MODEL INFERENCE ENGINE</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Placement Probability Predictor
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Adjust parameters across Academics, Coding, and Soft Skills. Click Recalculate to run ML prediction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePredict()}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Recalculate Probability</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: SLIDERS & PARAMETERS FORM (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* CATEGORY 1: ACADEMICS */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 bg-white/90">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  1. Academic Profile
                </h3>
              </div>

              {/* CGPA */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">CGPA (Undergraduate)</span>
                  <span className="text-indigo-600 font-mono text-sm">{features.cgpa.toFixed(1)} / 10.0</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="10.0"
                  step="0.1"
                  value={features.cgpa}
                  onChange={(e) => updateFeature("cgpa", parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* 10th & 12th Percentages */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">10th Percentage</span>
                    <span className="text-indigo-600 font-mono">{features.tenth_percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={features.tenth_percentage}
                    onChange={(e) => updateFeature("tenth_percentage", parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">12th Percentage</span>
                    <span className="text-indigo-600 font-mono">{features.twelfth_percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={features.twelfth_percentage}
                    onChange={(e) => updateFeature("twelfth_percentage", parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Backlogs & Attendance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Active Backlogs</span>
                    <span className={features.backlogs > 0 ? "text-rose-600 font-mono font-bold" : "text-emerald-600 font-mono font-bold"}>
                      {features.backlogs}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={features.backlogs}
                    onChange={(e) => updateFeature("backlogs", parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Attendance Percentage</span>
                    <span className="text-indigo-600 font-mono">{features.attendance_percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={features.attendance_percentage}
                    onChange={(e) => updateFeature("attendance_percentage", parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* CATEGORY 2: CODING & PRACTICAL */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 bg-white/90">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <Code className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  2. Coding & Practical Experience
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Projects Completed</span>
                    <span className="text-emerald-600 font-mono font-bold">{features.projects_completed}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={features.projects_completed}
                    onChange={(e) => updateFeature("projects_completed", parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Internships Completed</span>
                    <span className="text-emerald-600 font-mono font-bold">{features.internships_completed}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={features.internships_completed}
                    onChange={(e) => updateFeature("internships_completed", parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>

              {/* Coding Skill Rating */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Coding Skill Rating (0 - 5)</span>
                  <span className="text-emerald-600 font-mono text-sm">{features.coding_skill_rating} / 5 Stars</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={features.coding_skill_rating}
                  onChange={(e) => updateFeature("coding_skill_rating", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Hackathons & Certifications */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Hackathons Participated</span>
                    <span className="text-emerald-600 font-mono">{features.hackathons_participated}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="1"
                    value={features.hackathons_participated}
                    onChange={(e) => updateFeature("hackathons_participated", parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Certifications Count</span>
                    <span className="text-emerald-600 font-mono">{features.certifications_count}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={features.certifications_count}
                    onChange={(e) => updateFeature("certifications_count", parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* CATEGORY 3: SOFT SKILLS & BACKGROUND */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 bg-white/90">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <Users className="w-4 h-4 text-violet-600" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  3. Soft Skills & Background
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Communication Rating</span>
                    <span className="text-violet-600 font-mono">{features.communication_skill_rating} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={features.communication_skill_rating}
                    onChange={(e) => updateFeature("communication_skill_rating", parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Aptitude Rating</span>
                    <span className="text-violet-600 font-mono">{features.aptitude_skill_rating} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={features.aptitude_skill_rating}
                    onChange={(e) => updateFeature("aptitude_skill_rating", parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                </div>
              </div>

              {/* Dropdowns */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Engineering Branch</label>
                  <select
                    value={features.branch}
                    onChange={(e) => updateFeature("branch", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="ME">Mechanical (ME)</option>
                    <option value="CE">Civil (CE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Extracurriculars</label>
                  <select
                    value={features.extracurricular_involvement}
                    onChange={(e) => updateFeature("extracurricular_involvement", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTS & GAUGE (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* GAUGE CARD */}
            <div className="glass-panel-glow p-8 rounded-3xl border border-indigo-200 text-center flex flex-col items-center justify-center relative bg-white shadow-xl shadow-indigo-500/10">
              <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-mono font-bold text-indigo-700">
                Random Forest Inference
              </div>

              <div className="my-4">
                <Gauge probability={result?.placed_probability ?? 0.94} size={230} />
              </div>

              {/* Status Badge */}
              <div className="mt-4 w-full p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Predicted Outcome:</span>
                  <span className={`font-black font-mono text-sm ${result?.prediction === "Placed" ? "text-emerald-600" : "text-rose-600"}`}>
                    {result?.prediction ?? "Placed"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Prediction Confidence:</span>
                  <span className="text-indigo-600 font-mono font-bold">
                    {Math.round((result?.confidence ?? 0.94) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* COMPOSITE SCORE BREAKDOWN */}
            {result?.composite_scores && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4 bg-white/90">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Composite Score Breakdown
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-600">Overall Academic Index</span>
                      <span className="text-indigo-600 font-mono">{result.composite_scores.academic_score} / 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${result.composite_scores.academic_score}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-600">Practical & Coding Score</span>
                      <span className="text-emerald-600 font-mono">{result.composite_scores.practical_score} / 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${result.composite_scores.practical_score}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-600">Soft Skill & Extracurricular Index</span>
                      <span className="text-violet-600 font-mono">{result.composite_scores.soft_index} / 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-600 transition-all duration-500" style={{ width: `${result.composite_scores.soft_index}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIONABLE SUGGESTIONS */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4 bg-white/90">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Prioritized Actionable Suggestions
              </h4>

              {result?.suggestions && result.suggestions.length > 0 ? (
                <div className="space-y-3">
                  {result.suggestions.map((sug, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl text-xs flex items-start gap-3 border ${
                        sug.type === "improve"
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-emerald-50 border-emerald-200 text-emerald-900"
                      }`}
                    >
                      {sug.type === "improve" ? (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-relaxed font-medium">{sug.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Your profile meets or exceeds placed cohort benchmarks across all actionable features!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
