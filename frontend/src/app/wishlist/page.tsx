"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { getImageUrl } from "@/utils/getImageUrl";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backends.onrender.com/api';

export default function WishlistPage() {
  const { user, wishlist, setWishlist, addToCart, toggleWishlist } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all products and filter locally for now (simpler than adding a new backend route if one doesn't exist)
        const { data } = await axios.get(`${API_URL}/products`);
        const wishlistedProducts = data.filter((p: any) => wishlist.includes(p._id));
        setProducts(wishlistedProducts);
      } catch (error) {
        console.error("Failed to fetch wishlist products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist, user]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user?.token) return;
    await toggleWishlist(productId);
  };

  const handleMoveToCart = (product: any) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.png",
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M", // Default to first available size or M
      quantity: 1,
    });
    handleRemoveFromWishlist(product._id);
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center font-bold uppercase tracking-widest opacity-50">Loading Wishlist...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Heart className="w-16 h-16 opacity-20" />
        <h2 className="text-2xl font-black uppercase tracking-tighter text-[#111]">Please Login</h2>
        <p className="text-sm opacity-70">Log in to view your wishlist.</p>
        <Link href="/auth/login" className="bg-[#111] text-white px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">My Wishlist</h1>
      <p className="text-sm opacity-70 uppercase tracking-widest mb-12">{products.length} items</p>

      {products.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Your wishlist is empty</h2>
          <p className="text-sm opacity-70 mb-6">Save items you love here.</p>
          <Link href="/shop" className="bg-foreground text-background px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-foreground/90 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => (
            <motion.div 
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              <button 
                onClick={() => handleRemoveFromWishlist(product._id)}
                className="absolute top-2 right-2 z-10 bg-white shadow-md p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <Link href={`/product/${product._id}`}>
                <div className="relative aspect-[3/4] mb-4 bg-muted overflow-hidden">
                  <img 
                    src={getImageUrl(product.images?.[0])} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              
              <div>
                <Link href={`/product/${product._id}`}>
                  <h3 className="font-bold uppercase tracking-wider text-sm mb-1 line-clamp-1">{product.name}</h3>
                </Link>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm font-black text-[#111]">₹ {product.price}</p>
                </div>
                <button 
                  onClick={() => handleMoveToCart(product)}
                  className="w-full mt-4 bg-black text-white font-bold py-3 text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
                >
                  Move to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
