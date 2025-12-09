"use client";

import Image from "next/image";
import { Typography } from "./Typography";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-xl overflow-hidden border border-muted shadow-sm bg-background">
        <Image
          src="/Bot.jpg"
          alt="Bot Logo"
          width={48}
          height={48}
          className="object-cover"
        />
      </div>

      <div className="flex flex-col">
        <Typography variant="h2" weight="medium" textColor="muted">
          AI Chat Bot
        </Typography>
      </div>
    </div>
  );
}
