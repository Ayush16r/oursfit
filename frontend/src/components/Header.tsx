"use client";

import Link from "next/link";
import { ShoppingBag, User, Search, Menu, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backends.onrender.com/api';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const cart = useStore((state) => state.cart);
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/settings`);
        setSettings(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSettings();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
      {settings?.announcementActive && settings?.announcementText && (
        <div className="bg-accent text-white text-[10px] font-bold uppercase tracking-widest py-1.5 overflow-hidden whitespace-nowrap">
          <div className="animate-[marquee_20s_linear_infinite] inline-block">
            <span className="mx-4">{settings.announcementText}</span>
            <span className="mx-4">{settings.announcementText}</span>
            <span className="mx-4">{settings.announcementText}</span>
            <span className="mx-4">{settings.announcementText}</span>
            <span className="mx-4">{settings.announcementText}</span>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 mr-8">
            <Link href="/shop?category=men" className="text-sm font-bold uppercase tracking-wider hover:text-accent border-b-2 border-transparent hover:border-accent transition-all pb-1">
              MEN
            </Link>
            <Link href="/shop" className="text-sm font-bold uppercase tracking-wider hover:text-accent border-b-2 border-transparent hover:border-accent transition-all pb-1">
              ALL PRODUCTS
            </Link>
          </nav>
        </div>

        {/* Logo */}
        <Link href="/" className="text-3xl font-black uppercase tracking-tighter text-[#111] flex-shrink-0 absolute left-1/2 -translate-x-1/2 hover:scale-105 transition-transform">
          OURSFIT
        </Link>

        {/* Right Icons & Search */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-muted rounded-full px-4 py-1.5 w-64 border border-transparent focus-within:border-accent transition-colors">
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              className="bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <Search className="w-4 h-4 text-gray-500 ml-2 hover:text-accent transition-colors" />
            </button>
          </form>
          
          <Link href="/profile" className="p-2 hover:bg-muted rounded-full transition-colors">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/wishlist" className="p-2 hover:bg-muted rounded-full transition-colors hidden sm:block">
            <Heart className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="p-2 hover:bg-muted rounded-full transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-4 space-y-4">
              <Link href="/shop?category=men" className="text-xl font-bold uppercase tracking-wider" onClick={() => setIsMenuOpen(false)}>
                MEN
              </Link>
              <Link href="/shop" className="text-xl font-bold uppercase tracking-wider" onClick={() => setIsMenuOpen(false)}>
                ALL PRODUCTS
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
