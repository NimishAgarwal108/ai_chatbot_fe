import { NAVIGATION_ROUTES } from '@/app/Constant';
import { Bot, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Typography } from '../custom/Typography';

export const AIAssistantCard: React.FC = () => {
  return (
    <div className='w-full'>
      <Typography variant="h3" className="mb-4 flex items-center gap-2 text-white">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        AI Assistant
      </Typography>
      <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-xl">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <Typography variant="h4" className="mb-2 text-white">
          Your AI is Ready
        </Typography>
        <Typography variant="small" className="text-slate-400 mb-4">
          Start a conversation or make a call to get instant support from our AI assistant.
        </Typography>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Typography variant="small" className="text-slate-300">
              24/7 Availability
            </Typography>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <Typography variant="small" className="text-slate-300">
              Instant Responses
            </Typography>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <Typography variant="small" className="text-slate-300">
              Multi-language Support
            </Typography>
          </div>
        </div>
       <Link href={NAVIGATION_ROUTES.NEW_CHAT}>
        <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 text-white">
          <Sparkles className="w-4 h-4" />
          Start Conversation
        </button></Link></div>
       

    </div>
  );
};
