"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RefreshCw, Truck, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backends.onrender.com/api';

import { getImageUrl } from "@/utils/getImageUrl";

const categories = [
  { id: 1, name: "T-SHIRTS", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600" },
  { id: 2, name: "SHIRTS", image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=600" },
  { id: 3, name: "POLOS", image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600" },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products`);
        setProducts(data.slice(0, 8)); // Show top 8 products as new arrivals
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full bg-white">
      {/* Hero Carousel (Mocked with single image for now) */}
      <section className="relative w-full h-[60vh] md:h-[80vh] bg-[#f9ecb6] flex">
        <div className="flex w-full h-full">
           <div className="w-1/2 h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=1200" 
                alt="Summer Collection" 
                fill 
                priority
                sizes="50vw"
                className="object-cover"
              />
           </div>
           <div className="w-1/2 h-full relative flex items-center justify-center">
              <div className="absolute inset-0">
                <Image 
                  src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200" 
                  alt="T-Shirts" 
                  fill 
                  priority
                  sizes="50vw"
                  className="object-cover opacity-90"
                />
              </div>
              <div className="relative z-10 text-center">
                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-lg">NEW COLLECTION</h2>
                <p className="text-xl font-bold tracking-widest mt-2 uppercase text-white drop-shadow-md">Premium | Minimal | Streetwear</p>
              </div>
           </div>
        </div>
        
        <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {[0,1,2,3,4].map(dot => (
             <button key={dot} className={`w-2.5 h-2.5 rounded-full ${dot === 0 ? 'bg-accent' : 'bg-gray-300'}`}></button>
          ))}
        </div>
      </section>

      {/* Feature Strip */}
      <section className="bg-[#eff8f7] py-6 border-b border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center md:space-x-24 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Wallet className="w-8 h-8 text-black" />
            <div>
              <p className="font-bold text-sm">10% Cashback</p>
              <p className="text-xs">on all App orders</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <RefreshCw className="w-8 h-8 text-black" />
            <div>
              <p className="font-bold text-sm">30 days Easy Returns</p>
              <p className="text-xs">& Exchanges</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Truck className="w-8 h-8 text-black" />
            <div>
              <p className="font-bold text-sm">Free &</p>
              <p className="text-xs">Fast Shipping</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-center mb-16 text-[#111]">New Arrivals</h2>
          
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-8 snap-x scrollbar-hide">
              {products.length > 0 ? products.map((product) => (
                <div key={product._id} className="min-w-[280px] md:min-w-[350px] snap-start group cursor-pointer">
                  <Link href={`/product/${product._id}`}>
                    <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4">
                      <img 
                        src={getImageUrl(product.images?.[0])} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                        {product.category || "Oversized Fit"}
                      </div>
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute bottom-4 left-4 bg-black/80 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                          FEW LEFT
                        </div>
                      )}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-10 shadow-sm">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#2d2d2d] truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                      <div className="flex space-x-2 items-center mt-1">
                        <p className="font-bold text-sm text-[#2d2d2d]">₹ {product.price}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-[10px] line-through opacity-50 font-bold">₹ {product.originalPrice}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              )) : (
                 <div className="text-center w-full py-10 opacity-50 font-bold uppercase tracking-widest">Loading products...</div>
              )}
            </div>
            
            <button className="absolute left-0 top-1/3 -translate-y-1/2 bg-white/80 shadow p-2 rounded-full hidden md:block hover:bg-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="absolute right-0 top-1/3 -translate-y-1/2 bg-white/80 shadow p-2 rounded-full hidden md:block hover:bg-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-[#f9f9f9]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-center mb-16 text-[#111]">Shop by Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div key={category.id} className="text-center group cursor-pointer">
                <Link href={`/shop?category=${category.name.toLowerCase()}`}>
                  <div className="relative aspect-[4/5] bg-muted overflow-hidden mb-4">
                    <Image 
                      src={category.image} 
                      alt={category.name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-2xl font-extrabold uppercase tracking-widest text-[#2d2d2d]">{category.name}</h3>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
