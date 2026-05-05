"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { useStore } from "@/store/useStore";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backends.onrender.com/api';

import { getImageUrl } from "@/utils/getImageUrl";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSizeError, setShowSizeError] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  
  // Accordion state
  const [detailsOpen, setDetailsOpen] = useState(true);
  
  // Pincode state
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<{deliverable?: boolean, days?: number, checking?: boolean, error?: string} | null>(null);

  const { user, cart, addToCart, wishlist, toggleWishlist } = useStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products/${productId}`);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Check if this specific size is already in cart
  useEffect(() => {
    if (selectedSize && product) {
      const inCart = cart.some(item => item.id === product._id && item.size === selectedSize);
      setIsAddedToCart(inCart);
    } else {
      setIsAddedToCart(false);
    }
  }, [selectedSize, cart, product]);

  const handleAddToCart = () => {
    if (isAddedToCart) {
      router.push("/checkout");
      return;
    }

    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }
    
    setShowSizeError(false);
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.png",
      size: selectedSize,
      quantity,
    });
    // The useEffect will catch the change and set isAddedToCart to true
  };

  const handleToggleWishlist = async () => {
    if (!user?.token) {
      alert("Please login to add to wishlist");
      router.push("/auth/login");
      return;
    }
    await toggleWishlist(product._id);
  };

  const checkPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeStatus({ error: "Please enter a valid 6-digit pincode" });
      return;
    }
    
    setPincodeStatus({ checking: true });
    try {
      const { data } = await axios.get(`${API_URL}/pincodes/${pincode}`);
      if (data.deliverable) {
        setPincodeStatus({ deliverable: true, days: data.days });
      } else {
         setPincodeStatus({ deliverable: false });
      }
    } catch (error) {
      setPincodeStatus({ error: "Could not verify pincode at this time." });
    }
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest opacity-50">Loading product...</div>;
  }

  if (!product) {
     return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest opacity-50">Product not found</div>;
  }

  const isWishlisted = wishlist.includes(product._id);
  const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen max-w-7xl">
      <div className="text-xs text-muted-foreground mb-6 uppercase tracking-wider">
        <Link href="/" className="hover:text-foreground">Home</Link> / <Link href="/shop" className="hover:text-foreground">{product.category}</Link> / <span className="text-foreground">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 relative">
        {/* Images Column (Left) */}
        <div className="w-full lg:w-7/12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.images && product.images.length > 0 ? (
              product.images.map((img: string, idx: number) => (
                <div key={idx} className="relative aspect-[3/4] bg-muted w-full shrink-0 snap-center">
                  <img 
                    src={getImageUrl(img)} 
                    alt={`${product.name} view ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="relative aspect-[3/4] bg-muted w-full shrink-0 snap-center">
                 <img src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800" alt={product.name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Product Info Column (Right - Sticky) */}
        <div className="w-full lg:w-5/12">
          <div className="sticky top-24 space-y-6">
            
            {/* Title & Price */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{product.name}</h1>
              <p className="text-muted-foreground text-sm mb-4">{product.category}</p>
              
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">₹ {product.price}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Price incl. of all taxes</p>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-sm font-bold ${showSizeError ? "text-red-500" : ""}`}>
                  {showSizeError ? "Please select a size." : "Please select a size."}
                </span>
                <button className="text-xs text-teal-600 font-bold tracking-wide hover:underline">SIZE CHART</button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {sizes.map((size: string) => {
                  const isAvailable = (product.sizes || sizes).includes(size); // Assuming sizes array in DB means available
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSize(size);
                          setShowSizeError(false);
                        }
                      }}
                      disabled={!isAvailable}
                      className={`min-w-[48px] h-10 px-2 text-sm border rounded flex items-center justify-center transition-colors
                        ${!isAvailable ? "opacity-30 cursor-not-allowed border-muted" : 
                          selectedSize === size 
                            ? "border-foreground bg-foreground text-background font-bold" 
                            : "border-border hover:border-foreground bg-transparent text-foreground"
                        }
                      `}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center space-x-4">
               <span className="text-sm">Quantity</span>
               <div className="relative">
                 <select 
                   value={quantity} 
                   onChange={(e) => setQuantity(Number(e.target.value))}
                   className="appearance-none border border-border bg-transparent py-2 pl-4 pr-10 rounded focus:outline-none focus:border-foreground"
                 >
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                     <option key={num} value={num}>{num < 10 ? `0${num}` : num}</option>
                   ))}
                 </select>
                 <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
               </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-[#F14633] hover:bg-[#D93D2C] text-white font-bold py-3 px-6 rounded transition-colors text-sm tracking-wide"
              >
                {isAddedToCart ? "GO TO CART" : "ADD TO CART"}
              </button>
              
              <button 
                onClick={handleToggleWishlist}
                className="flex-1 border border-[#009688] text-[#009688] hover:bg-[#009688]/5 font-bold py-3 px-6 rounded flex items-center justify-center space-x-2 transition-colors text-sm tracking-wide"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                <span>ADD TO WISHLIST</span>
              </button>
            </div>

            {/* Share */}
            <div className="flex items-center space-x-4 pt-4 border-t border-border mt-6">
              <span className="text-sm opacity-70">Share</span>
              <div className="flex space-x-3">
                 <button className="opacity-70 hover:opacity-100 transition-opacity"><Share2 className="w-5 h-5" /></button>
                 <button className="opacity-70 hover:opacity-100 transition-opacity"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></button>
                 <button className="opacity-70 hover:opacity-100 transition-opacity"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></button>
                 <button className="opacity-70 hover:opacity-100 transition-opacity"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></button>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="pt-4">
              <h3 className="font-bold text-sm mb-3">Delivery Details</h3>
              <div className="relative">
                <input 
                  type="text" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter Pincode"
                  className="w-full border border-border bg-transparent py-3 pl-4 pr-20 rounded focus:outline-none focus:border-foreground text-sm"
                />
                <button 
                  onClick={checkPincode}
                  disabled={pincodeStatus?.checking}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-600 font-bold text-sm hover:underline disabled:opacity-50"
                >
                  {pincodeStatus?.checking ? "..." : "CHECK"}
                </button>
              </div>
              {pincodeStatus?.deliverable && (
                 <p className="text-xs text-green-600 mt-2">Delivery available in {pincodeStatus.days} days.</p>
              )}
              {pincodeStatus?.deliverable === false && (
                 <p className="text-xs text-red-500 mt-2">Currently out of delivery area.</p>
              )}
              {pincodeStatus?.error && (
                 <p className="text-xs text-red-500 mt-2">{pincodeStatus.error}</p>
              )}

              <div className="flex items-start space-x-3 mt-4 border border-border rounded p-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 mt-0.5"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  This product is eligible for return or exchange under our 30-day return or exchange policy. No questions asked.
                </p>
              </div>
            </div>

            {/* Product Details Accordion */}
            <div className="border border-border rounded mt-4">
              <button 
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full flex justify-between items-center p-4 font-bold text-sm bg-muted/20"
              >
                <span>Product Details</span>
                {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {detailsOpen && (
                <div className="p-4 pt-0 border-t border-border bg-muted/10 text-sm space-y-4">
                  <div className="mt-4">
                    <h4 className="font-bold mb-1">Material & Care:</h4>
                    <p className="text-muted-foreground text-xs">100% Cotton</p>
                    <p className="text-muted-foreground text-xs">Machine Wash</p>
                  </div>
                  
                  {product.details && product.details.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-1">Features:</h4>
                      <ul className="list-disc pl-4 text-muted-foreground text-xs space-y-1">
                        {product.details.map((detail: string, i: number) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                     <p className="text-muted-foreground text-xs">{product.description}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
