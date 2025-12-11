"use client";
import { Typography } from '@/components/custom/Typography';
import { User } from 'lucide-react';

export default function SelfVideoPreview() {
  return (
    <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 border-2 border-slate-700 rounded-lg overflow-hidden">
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
        <User className="w-8 h-8 text-slate-500" />
      </div>
      <div className="absolute bottom-1 left-1 bg-slate-900/80 backdrop-blur-sm rounded px-1.5 py-0.5">
        <Typography variant="small" className="text-white text-xs">
          You
        </Typography>
      </div>
    </div>
  );
}

