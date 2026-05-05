"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backends.onrender.com/api';

import { getImageUrl } from "@/utils/getImageUrl";

import { Suspense } from "react";

function ShopContent() {
  const searchParams = useSearchParams();
  const searchFilter = searchParams.get('search')?.toLowerCase() || "";
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products`);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
     const cats = new Set(products.map(p => p.category));
     return ["All", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = !searchFilter || p.name.toLowerCase().includes(searchFilter) || p.category?.toLowerCase().includes(searchFilter);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-border pb-8">
        <div>
          <h1 className="text-5xl font-extrabold uppercase tracking-tighter mb-2">Collection</h1>
          <p className="text-sm opacity-70 uppercase tracking-widest">Showing {filteredProducts.length} items</p>
        </div>
        
        <div className="mt-6 md:mt-0 flex space-x-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-bold uppercase tracking-widest px-4 py-2 whitespace-nowrap transition-colors ${
                activeCategory === cat ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
        {filteredProducts.length > 0 ? filteredProducts.map((product) => (
          <motion.div 
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group cursor-pointer"
          >
            <Link href={`/product/${product._id}`}>
              <div className="relative aspect-[3/4] mb-4 bg-muted overflow-hidden">
                <img 
                  src={getImageUrl(product.images?.[0])} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-background text-foreground text-xs font-bold uppercase tracking-widest px-6 py-3">
                    View Details
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-sm mb-1">{product.name}</h3>
                  <p className="text-xs opacity-50 uppercase tracking-widest">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹ {product.price}</p>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <p className="text-[10px] line-through opacity-50 font-bold">₹ {product.originalPrice}</p>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        )) : (
          <div className="col-span-full text-center py-10 opacity-50 font-bold uppercase tracking-widest">
             No products found.
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest opacity-50">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
