import { Typography } from '@/components/custom/Typography';

interface FeatureProps {
  text: string;
}

export function Feature({ text }: FeatureProps) {
  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
      <Typography variant="small" className="text-slate-400 text-sm">
        {text}
      </Typography>
    </div>
  );
}