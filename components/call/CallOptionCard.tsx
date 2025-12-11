import { CallType } from '@/app/call.types';
import { Feature } from '@/components/call/Feature';
import { Typography } from '@/components/custom/Typography';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface CallOptionCardProps {
  type: CallType;
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  hoverColor: string;
  onStartCall: (type: CallType) => void;
}

export const CallOptionCard: React.FC<CallOptionCardProps> = ({
  type,
  icon: Icon,
  title,
  description,
  features,
  gradient,
  hoverColor,
  onStartCall,
}) => {
  return (
    <button
      onClick={() => onStartCall(type)}
      className={`group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 hover:border-${hoverColor} transition-all hover:shadow-xl hover:shadow-${hoverColor}/20 hover:scale-105`}
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-${hoverColor}/50`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <Typography variant="h3" align="center" className="mb-3 text-white">
        {title}
      </Typography>
      <Typography variant="small" align="center" className="text-slate-400 mb-4">
        {description}
      </Typography>
      <div className="space-y-2">
        {features.map((feature, index) => (
          <Feature key={index} text={feature} />
        ))}
      </div>
    </button>
  );
};