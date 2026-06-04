import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfidenceGaugeProps {
  confidence: number; // 0 to 1
  origin: string;
}

export default function ConfidenceGauge({ confidence, origin }: ConfidenceGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    // Animate the value on mount or change
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const targetValue = Math.round(confidence * 1000) / 10; // e.g. 44.3

    const interval = setInterval(() => {
      currentStep++;
      setAnimatedValue(Math.min((targetValue * currentStep) / steps, targetValue));
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [confidence]);

  const percentage = Math.round(confidence * 100);
  
  let color = 'text-green-500';
  let strokeColor = '#22c55e'; // green-500
  let bgColor = 'rgba(34, 197, 94, 0.1)';
  let glowColor = 'rgba(34, 197, 94, 0.4)';

  if (percentage < 60) {
    color = 'text-red-500';
    strokeColor = '#ef4444'; // red-500
    bgColor = 'rgba(239, 68, 68, 0.1)';
    glowColor = 'rgba(239, 68, 68, 0.4)';
  } else if (percentage < 80) {
    color = 'text-yellow-500';
    strokeColor = '#eab308'; // yellow-500
    bgColor = 'rgba(234, 179, 8, 0.1)';
    glowColor = 'rgba(234, 179, 8, 0.4)';
  }

  // Calculate SVG stroke attributes
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence * circumference);

  return (
    <div className="relative flex flex-col items-center justify-center">
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
            strokeWidth="12"
            className="text-muted/30"
          />
          {/* Progress Track */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
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
          <span className={`text-4xl font-black font-mono tracking-tighter ${color} tabular-nums`}>
            {animatedValue.toFixed(1)}%
          </span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">
            Confidence
          </span>
        </div>
      </div>
    </div>
  );
}
