import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface ConfidenceGaugeProps {
  confidence: number; // 0 to 1
  origin: string;
}

export default function ConfidenceGauge({ confidence, origin }: ConfidenceGaugeProps) {
  const percentage = Math.round(confidence * 100);
  
  let colorClass = 'text-green-500';
  let strokeColor = '#22c55e'; // green-500
  let glowColor = 'rgba(34, 197, 94, 0.4)';
  let label = 'High Reliability';

  if (percentage < 60) {
    colorClass = 'text-red-500';
    strokeColor = '#ef4444'; // red-500
    glowColor = 'rgba(239, 68, 68, 0.4)';
    label = 'Low Reliability';
  } else if (percentage < 75) {
    colorClass = 'text-amber-500';
    strokeColor = '#f59e0b'; // amber-500
    glowColor = 'rgba(245, 158, 11, 0.4)';
    label = 'Needs Validation';
  } else if (percentage < 90) {
    colorClass = 'text-blue-500';
    strokeColor = '#3b82f6'; // blue-500
    glowColor = 'rgba(59, 130, 246, 0.4)';
    label = 'Moderate Reliability';
  }

  // Calculate SVG stroke attributes
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence * circumference);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Micro-label Top */}
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
        Confidence Score
      </span>

      {/* SVG Circular Progress */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 140 140"
        >
          {/* Background Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          {/* Progress Track */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut" }}
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              filter: `drop-shadow(0 0 8px ${glowColor})`
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-5xl font-black font-mono tracking-tighter ${colorClass} tabular-nums`}>
            <CountUp end={percentage} duration={2} />%
          </span>
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
            Model Certainty
          </span>
        </div>
      </div>

      {/* Micro-label Bottom */}
      <div className={`mt-6 px-4 py-1.5 rounded-full border border-current/20 bg-current/5 ${colorClass} font-semibold text-xs uppercase tracking-wider`}>
        {label}
      </div>
    </div>
  );
}
