"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Gauge } from "@/components/Gauge";
import { predictPlacement } from "@/lib/api";
import {
  Brain,
  Sparkles,
  ArrowRight,
  Cpu,
  FileText,
  BarChart2,
  CheckCircle2,
  Zap,
  Target,
  Award,
  TrendingUp,
  Sliders,
} from "lucide-react";

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [cgpa, setCgpa] = useState<number>(8.5);
  const [codingRating, setCodingRating] = useState<number>(4);
  const [projects, setProjects] = useState<number>(5);
  const [internships, setInternships] = useState<number>(1);

  const [prediction, setPrediction] = useState<{
    placed_probability: number;
    prediction: string;
  }>({
    placed_probability: 0.94,
    prediction: "Placed",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }
      );
    }
  }, []);

  const handleQuickPredict = async (
    newCgpa = cgpa,
    newCoding = codingRating,
    newProj = projects,
    newIntern = internships
  ) => {
    setLoading(true);
    try {
      const res = await predictPlacement({
        cgpa: newCgpa,
        coding_skill_rating: newCoding,
        projects_completed: newProj,
        internships_completed: newIntern,
      });
      setPrediction({
        placed_probability: res.placed_probability,
        prediction: res.prediction,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans tech-grid-bg selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative">
        {/* Soft Background Mesh Glow Spotlights */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* HERO SECTION */}
        <section ref={heroRef} className="text-center py-10 sm:py-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-sm shadow-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Next-Gen Machine Learning Engine • 94.2% ROC-AUC</span>
          </div>

          <h1
            ref={titleRef}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1] mb-6"
          >
            Predict Your Campus Placement with{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Neural Precision
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Upload your resume or adjust interactive academic & skill parameters to get instant placement probability, cohort benchmark analysis, and actionable career suggestions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/predict"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2.5 group active:scale-95"
            >
              <span>Launch Predictor Engine</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/resume-analyzer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2.5"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Smart ATS Resume Parser</span>
            </Link>
          </div>

          {/* QUICK STATS BAND */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left mb-16">
            {[
              { label: "Benchmarked Profiles", val: "5,000+", icon: Brain, color: "text-indigo-600", border: "border-indigo-100" },
              { label: "Top Model ROC-AUC", val: "94.2%", icon: Award, color: "text-emerald-600", border: "border-emerald-100" },
              { label: "Evaluated Models", val: "7 Algorithms", icon: Cpu, color: "text-violet-600", border: "border-violet-100" },
              { label: "Feature Signals", val: "22 Features", icon: Sliders, color: "text-blue-600", border: "border-blue-100" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="glass-panel p-6 rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                    {stat.val}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* INTERACTIVE PREDICTOR WIDGET DEMO */}
        <section className="my-12">
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-10 border border-indigo-200 relative overflow-hidden bg-white shadow-xl shadow-indigo-500/5">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-mono font-bold rounded-bl-2xl border-l border-b border-indigo-100">
              Live Model Demo Widget
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Controls */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                    <Zap className="w-6 h-6 text-indigo-600" />
                    Try Live Quick Prediction
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Drag the sliders to see real-time probability shift driven by our Random Forest pipeline.
                  </p>
                </div>

                {/* CGPA Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">CGPA Score</span>
                    <span className="text-indigo-600 font-mono text-sm">{cgpa.toFixed(1)} / 10.0</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="10.0"
                    step="0.1"
                    value={cgpa}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCgpa(val);
                      handleQuickPredict(val, codingRating, projects, internships);
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Coding Skill Rating */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Coding Skill Rating</span>
                    <span className="text-indigo-600 font-mono text-sm">{codingRating} / 5 Stars</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={codingRating}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setCodingRating(val);
                      handleQuickPredict(cgpa, val, projects, internships);
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Projects & Internships */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Projects</span>
                      <span className="text-indigo-600 font-mono">{projects}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={projects}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setProjects(val);
                        handleQuickPredict(cgpa, codingRating, val, internships);
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Internships</span>
                      <span className="text-indigo-600 font-mono">{internships}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={internships}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setInternships(val);
                        handleQuickPredict(cgpa, codingRating, projects, val);
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Right Radial Gauge Display */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-inner">
                <Gauge probability={prediction.placed_probability} size={210} />
                <Link
                  href="/predict"
                  className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-xs"
                >
                  <span>Open Full Predictor with All 22 Parameters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CORE PLATFORM MODULES */}
        <section className="my-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Comprehensive Campus Placement Toolkit
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
              Everything you need to evaluate, optimize, and boost your campus placement readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Direct Predictor</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Input academic marks, coding ratings, hackathons, and soft skills to compute exact placement probability with actionable gap recommendations.
                </p>
              </div>
              <Link
                href="/predict"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>Launch Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">ATS Resume Parser</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Upload your PDF resume to automatically extract contact info, education, skills, projects, and calculate placement chances without manual input.
                </p>
              </div>
              <Link
                href="/resume-analyzer"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                <span>Analyze Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 mb-6 shadow-sm">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Model Performance</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Inspect the benchmark leaderboard comparing 7 machine learning models, permutation feature importances, ROC curves, and confusion matrix.
                </p>
              </div>
              <Link
                href="/model-performance"
                className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-800"
              >
                <span>View Metrics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
