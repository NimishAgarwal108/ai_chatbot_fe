"use client";

import Login from "@/components/custom/Login";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <>
    <Login/>
    </>
  );
}
