"use client";
import { CallStatus, CallType } from "@/app/call.types";
import { Typography } from "@/components/custom/Typography";
import { Phone, User } from "lucide-react";
interface VideoDisplayProps {
  callType: CallType;
  callStatus: CallStatus;
  isVideoEnabled: boolean;
}
export default function VideoDisplay({
  callType,
  callStatus,
  isVideoEnabled,
}: VideoDisplayProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {" "}
      {callType === "video" && isVideoEnabled ? (
        <div className="text-center">
          {" "}
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse shadow-lg shadow-purple-500/50">
            {" "}
            <User className="w-16 h-16 text-white" />{" "}
          </div>{" "}
          <Typography variant="h3" className="text-white mb-2">
            {" "}
            AI Assistant{" "}
          </Typography>{" "}
          <Typography variant="small" className="text-slate-400">
            {" "}
            Video Connected{" "}
          </Typography>{" "}
        </div>
      ) : (
        <div className="text-center">
          {" "}
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse shadow-lg shadow-blue-500/50">
            {" "}
            <Phone className="w-16 h-16 text-white" />{" "}
          </div>{" "}
          <Typography variant="h3" className="text-white mb-2">
            {" "}
            AI Assistant{" "}
          </Typography>{" "}
          <Typography variant="small" className="text-slate-400">
            {" "}
            {callStatus === "ringing"
              ? "Connecting..."
              : "Voice Call Active"}{" "}
          </Typography>{" "}
        </div>
      )}{" "}
    </div>
  );
}
