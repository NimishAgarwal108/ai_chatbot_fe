import { Typography } from '@/components/custom/Typography';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface FeatureInfoProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export const FeatureInfo: React.FC<FeatureInfoProps> = ({
  icon: Icon,
  title,
  description,
  color,
}) => {
  return (
    <div>
      <div className={`w-12 h-12 bg-${color}-500/20 rounded-xl flex items-center justify-center mx-auto mb-3`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <Typography variant="small" className="text-white font-semibold mb-1">
        {title}
      </Typography>
      <Typography variant="small" className="text-slate-400">
        {description}
      </Typography>
    </div>
  );
};
