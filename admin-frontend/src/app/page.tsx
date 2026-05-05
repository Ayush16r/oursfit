"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export default function AdminHomePage() {
  const router = useRouter();
  const { user } = useStore();

  useEffect(() => {
    if (user?.token) {
      router.push("/admin");
    } else {
      router.push("/auth/login");
    }
  }, [user, router]);

  return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest opacity-50">Loading...</div>;
}
