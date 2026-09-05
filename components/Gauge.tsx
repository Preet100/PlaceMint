"use client";

import React from "react";
import { motion } from "framer-motion";

interface GaugeProps {
  probability: number; // 0.0 to 1.0
  size?: number;
  label?: string;
}

export function Gauge({ probability, size = 220, label = "Placement Probability" }: GaugeProps) {
  const percentage = Math.round(probability * 100);
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; 
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  const getColorScheme = (val: number) => {
    if (val >= 75) return { stroke: "#059669", glow: "rgba(5, 150, 105, 0.25)", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" };
    if (val >= 50) return { stroke: "#2563eb", glow: "rgba(37, 99, 235, 0.25)", text: "text-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" };
    if (val >= 30) return { stroke: "#d97706", glow: "rgba(217, 119, 6, 0.25)", text: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200 shadow-sm" };
    return { stroke: "#dc2626", glow: "rgba(220, 38, 38, 0.25)", text: "text-rose-600", badge: "bg-rose-50 text-rose-700 border-rose-200 shadow-sm" };
  };

  const colors = getColorScheme(percentage);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-[135deg]" width={size} height={size}>
          {/* Light Track background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Animated Gauge Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 4px 10px ${colors.glow})`,
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            className={`text-4xl font-black font-mono tracking-tight ${colors.text}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {percentage}%
          </motion.span>
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
            {label}
          </span>
        </div>
      </div>

      {/* Status Pill */}
      <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold border ${colors.badge}`}>
        {percentage >= 70 ? "High Placement Probability" : percentage >= 45 ? "Moderate Placement Potential" : "Targeted Improvement Needed"}
      </div>
    </div>
  );
}
