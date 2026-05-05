"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backends.onrender.com/api';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      setUser(data);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 border border-border"
      >
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Welcome Back</h1>
        <p className="text-sm opacity-70 mb-8 uppercase tracking-widest">Login to your account</p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 mb-6 text-sm font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-3 bg-transparent border border-border focus:border-foreground focus:outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-3 bg-transparent border border-border focus:border-foreground focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="accent-foreground" />
              <span>Remember Me</span>
            </label>
            <Link href="/auth/forgot" className="hover:opacity-70 transition-opacity">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="w-full btn-primary">
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold uppercase tracking-widest">
          <span className="opacity-70">New to OursFit? </span>
          <Link href="/auth/signup" className="hover:underline underline-offset-4">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
