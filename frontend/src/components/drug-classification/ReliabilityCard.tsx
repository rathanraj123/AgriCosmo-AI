import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, AlertTriangle, ShieldAlert, Info } from 'lucide-react';

interface ReliabilityCardProps {
  confidence: number; // 0 to 1
}

export default function ReliabilityCard({ confidence }: ReliabilityCardProps) {
  const percentage = Math.round(confidence * 100);
  
  let status = 'Low';
  let color = 'text-red-500';
  let bg = 'bg-red-500/10';
  let border = 'border-red-500/20';
  let Icon = ShieldAlert;
  let message = 'This prediction has significant uncertainty because structural features overlap heavily with multiple biological origin classes. Manual verification is strongly advised.';

  if (percentage >= 80) {
    status = 'Very High';
    color = 'text-emerald-500';
    bg = 'bg-emerald-500/10';
    border = 'border-emerald-500/20';
    Icon = ShieldCheck;
    message = 'This prediction is highly reliable. The molecular structure strongly matches known patterns for this specific origin class with minimal ambiguity.';
  } else if (percentage >= 60) {
    status = 'High';
    color = 'text-green-500';
    bg = 'bg-green-500/10';
    border = 'border-green-500/20';
    Icon = ShieldCheck;
    message = 'This prediction is reliable. The molecular structure aligns well with the predicted origin class, though minor overlaps exist.';
  } else if (percentage >= 40) {
    status = 'Medium';
    color = 'text-amber-500';
    bg = 'bg-amber-500/10';
    border = 'border-amber-500/20';
    Icon = AlertTriangle;
    message = 'This prediction has moderate uncertainty. The compound shares structural motifs commonly found across multiple origin domains.';
  }

  return (
    <Card className={`w-full ${bg} ${border} shadow-sm overflow-hidden`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl bg-background ${border} shadow-sm shrink-0`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              Prediction Reliability
            </h4>
            <div className={`text-lg font-black tracking-tight ${color}`}>
              {status} Confidence
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mt-2">
              <Info className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
              {message}
            </p>
          </div>
        </div>
        
        {/* Reliability Meter Bar */}
        <div className="mt-5 h-2 w-full bg-background rounded-full overflow-hidden border border-border/50">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out`}
            style={{ 
              width: `${percentage}%`,
              backgroundColor: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#22c55e' : percentage >= 40 ? '#f59e0b' : '#ef4444' 
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
