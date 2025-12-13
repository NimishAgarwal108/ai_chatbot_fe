"use client";
import { Typography } from '@/components/custom/Typography';
import { PhoneOff } from 'lucide-react';

export function CallEndedScreen() {
  return (
    <div className="text-center">
      <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <PhoneOff className="w-12 h-12 text-slate-400" />
      </div>
      <Typography variant="h2" align="center" className="mb-3 text-white">
        Call Ended
      </Typography>
      <Typography variant="paragraph" align="center" className="text-slate-400">
        Thank you for using AI Support
      </Typography>
    </div>
  );
}