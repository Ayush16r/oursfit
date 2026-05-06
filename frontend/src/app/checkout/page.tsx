"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Tag, Gift, ChevronDown, ChevronUp, MapPin, X, Check, Plus } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import Script from "next/script";
import { getImageUrl } from "@/utils/getImageUrl";
import PaymentSuccessModal from "@/components/PaymentSuccessModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backends.onrender.com/api';
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SkPHLgVLe7WUIn';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, removeFromCart, updateQuantity, clearCart, appliedCoupon, setAppliedCoupon, wishlist, setWishlist, addresses, setAddresses } = useStore();
  
  const [step, setStep] = useState<"BAG" | "ADDRESS" | "PAYMENT">("BAG");
  const [storeSettings, setStoreSettings] = useState<any>(null);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/settings`);
        setStoreSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();
  }, []);
  
  // Settings mapping
  const freeShippingThreshold = storeSettings?.freeShippingThreshold || 1000;
  const deliveryDays = storeSettings?.deliveryDays || 5;
  const codFeeSettings = storeSettings?.codFee !== undefined ? storeSettings.codFee : 50;
  const gstPercentage = storeSettings?.gstPercentage !== undefined ? storeSettings.gstPercentage : 18;
  const gstThreshold = storeSettings?.gstThreshold !== undefined ? storeSettings.gstThreshold : 1000;

  // Pricing
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const memberSavings = user?.isMember ? Math.min(100, subtotal * 0.1) : 0; // Fake logic: 10% up to 100
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discountPercentage) / 100 : 0;
  const shipping = subtotal > freeShippingThreshold ? 0 : 50;
  const discountTotal = memberSavings + couponDiscount;
  const netSubtotal = subtotal - discountTotal;
  const gstAmount = netSubtotal < gstThreshold ? (netSubtotal * gstPercentage) / 100 : 0;
  // Note: Payment Method state is needed here to determine COD fee but it's defined later. 
  // We'll compute codFee dynamically inside the BillingDetails and pass to totalAmount dynamically during render/submission.

  // Accorion states
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponError, setCouponError] = useState("");

  // Address states
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: user?.name || "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
    type: "Home",
    isDefault: false
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Load Razorpay
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleApplyCoupon = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/coupons/validate`, { code: couponCodeInput });
      setAppliedCoupon({ code: couponCodeInput, discountPercentage: data.discountPercentage });
      setCouponError("");
      setCouponOpen(false);
    } catch (error: any) {
      setCouponError(error.response?.data?.message || "Invalid coupon");
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_URL}/auth/wishlist`, { productId }, config);
      setWishlist(data.wishlist);
    } catch (error) {
      console.error(error);
    }
  };

  const saveNewAddress = async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const addressToSave = {
        street: `${newAddress.street}, ${newAddress.phone}`,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        country: newAddress.country
      };
      const { data } = await axios.post(`${API_URL}/auth/address`, addressToSave, config);
      setAddresses(data.addresses);
      setShowAddressModal(false);
      setSelectedAddressIndex(data.addresses.length - 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.token) {
      alert("Please login");
      router.push("/auth/login");
      return;
    }

    const selAddress = addresses[selectedAddressIndex];
    if (!selAddress) {
       alert("Please select an address");
       return;
    }

    try {
      setIsPlacingOrder(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const mappedOrderItems = cart.map(item => ({
        name: item.name,
        qty: item.quantity,
        image: item.image,
        price: item.price,
        size: item.size,
        product: item.id.length === 24 ? item.id : "64a0f4b3e8e45a0b8c8d0a0b"
      }));

      const { data: orderData } = await axios.post(
        `${API_URL}/payment/create-order`,
        {
          orderItems: mappedOrderItems,
          shippingAddress: selAddress,
          paymentMethod: paymentMethod === "Card" ? "Razorpay" : paymentMethod,
          itemsPrice: subtotal,
          taxPrice: gstAmount,
          shippingPrice: shipping,
          totalPrice: netSubtotal + shipping + gstAmount + (paymentMethod === "COD" ? codFeeSettings : 0),
        },
        config
      );

      const isRazorpayMethod = ["Pay with any UPI App", "Wallets", "Credit & Debit Cards", "Netbanking", "CRED pay"].includes(paymentMethod);

      if (isRazorpayMethod) {
        const options = {
          key: RAZORPAY_KEY,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "OursFit",
          description: "Premium Clothing Order",
          order_id: orderData.razorpayOrderId,
          handler: async function (response: any) {
            try {
              await axios.post(
                `${API_URL}/payment/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderData.orderId,
                },
                config
              );
              setPlacedOrderId(orderData.orderId);
              setShowSuccessModal(true);
              clearCart();
            } catch (err) {
              alert("Payment verification failed.");
            }
          },
          prefill: { name: user.name, email: user.email, contact: "9999999999" },
          theme: { color: "#009688" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else if (paymentMethod === "COD") {
        // Confirm COD
        await axios.post(
          `${API_URL}/payment/confirm-cod`,
          { orderId: orderData.orderId },
          config
        );
        setPlacedOrderId(orderData.orderId);
        setShowSuccessModal(true);
        clearCart();
      } else {
         alert("Invalid payment method selected.");
      }
    } catch (error) {
      console.error(error);
      alert("Order failed.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const BillingDetails = () => (
    <div className="bg-background p-6">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Billing Details</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Cart Total <span className="text-xs opacity-70">(Incl. of all taxes)</span></span>
          <span className="font-bold">₹ {subtotal.toFixed(2)}</span>
        </div>
        
        {memberSavings > 0 && (
          <div className="flex justify-between items-center py-2 px-3 rounded-md bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700">
            <span className="font-bold">Member Savings</span>
            <span className="font-bold">- ₹ {memberSavings.toFixed(2)}</span>
          </div>
        )}

        {appliedCoupon && (
          <div className="flex justify-between items-center text-teal-600">
            <span className="font-bold">Coupon ({appliedCoupon.code})</span>
            <span className="font-bold">- ₹ {couponDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Shipping Charges</span>
          <span>
            {shipping === 0 ? (
              <><span className="text-teal-600 font-bold">Free</span> <span className="line-through text-muted-foreground text-xs">₹ 50.00</span></>
            ) : (
              <span className="font-bold">₹ {shipping.toFixed(2)}</span>
            )}
          </span>
        </div>

        {paymentMethod === "COD" && (
          <div className="flex justify-between">
            <span>COD Fee</span>
            <span className="font-bold">₹ {codFeeSettings.toFixed(2)}</span>
          </div>
        )}

        {gstAmount > 0 && (
          <div className="flex justify-between">
            <span>GST ({gstPercentage}%)</span>
            <span className="font-bold">₹ {gstAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-border pt-4 mt-2 flex justify-between font-bold text-base">
          <span>Total Amount <span className="text-xs font-normal opacity-70">(Incl. of GST)</span></span>
          <span>₹ {(netSubtotal + shipping + gstAmount + (paymentMethod === "COD" ? codFeeSettings : 0)).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header Stepper */}
      <div className="bg-background border-b border-border py-4 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 flex justify-center items-center max-w-4xl">
          <div className="flex items-center space-x-4">
            <div className={`text-xs font-bold uppercase tracking-widest ${step === "BAG" ? "text-teal-600" : "text-foreground"}`}>My Bag</div>
            <div className="text-muted-foreground tracking-[0.2em] opacity-50">--------</div>
            <div className={`text-xs font-bold uppercase tracking-widest ${step === "ADDRESS" ? "text-teal-600" : step === "PAYMENT" ? "text-foreground" : "text-muted-foreground opacity-50"}`}>Address</div>
            <div className="text-muted-foreground tracking-[0.2em] opacity-50">--------</div>
            <div className={`text-xs font-bold uppercase tracking-widest ${step === "PAYMENT" ? "text-teal-600" : "text-muted-foreground opacity-50"}`}>Payment</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-6xl">
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-background rounded shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Your Bag is Empty!</h2>
            <Link href="/shop" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded font-bold uppercase tracking-wide inline-block">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {step === "BAG" && (
                <>
                  {user?.isMember && (
                    <div className="bg-background p-4 flex items-center space-x-2 text-sm text-[#F14633] font-bold shadow-sm rounded-sm">
                      <Tag className="w-5 h-5" />
                      <span>Member Savings on this order are ₹ {memberSavings.toFixed(0)}</span>
                    </div>
                  )}

                  <div className="bg-background shadow-sm rounded-sm">
                    <div className="p-4 border-b border-border flex justify-between items-center text-sm font-bold text-teal-600">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4" />
                        <span>{cart.length}/{cart.length} ITEMS SELECTED (₹ {subtotal.toFixed(0)})</span>
                      </div>
                      <Heart className="w-5 h-5 text-muted-foreground cursor-pointer" />
                    </div>

                    <div className="divide-y divide-border">
                      {cart.map((item) => (
                        <div key={`${item.id}-${item.size}`} className="p-4 flex gap-3 md:gap-4 relative">
                          <div className="hidden sm:block">
                            <input type="checkbox" defaultChecked className="mt-2 accent-teal-600 w-4 h-4" />
                          </div>
                          <div className="w-20 md:w-24 aspect-[3/4] relative bg-muted rounded shrink-0">
                            <Image src={getImageUrl(item.image)} alt={item.name} fill className="object-cover rounded" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                              <div className="truncate pr-2">
                                <h3 className="font-bold text-sm text-foreground truncate">{item.name}</h3>
                                <p className="text-xs text-muted-foreground mb-3 truncate">Oversized T-Shirts</p>
                                
                                <div className="flex space-x-2 md:space-x-4">
                                  <select 
                                    className="border border-border text-xs py-1 px-1 md:px-2 rounded bg-background"
                                    value={item.size}
                                    disabled
                                  >
                                    <option>Size: {item.size}</option>
                                  </select>
                                  <select 
                                    className="border border-border text-xs py-1 px-1 md:px-2 rounded bg-background"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, item.size, Number(e.target.value))}
                                  >
                                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>Qty: {n}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div className="sm:text-right shrink-0 mt-2 sm:mt-0">
                                <div className="font-bold text-sm">
                                  ₹ {item.price} 
                                  <span className="line-through text-[10px] text-muted-foreground ml-1">₹ {item.price + 100}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">MRP incl. of all taxes</div>
                                {user?.isMember && <div className="text-[10px] text-[#F14633] mt-0.5 font-bold">Member Savings: ₹ 100</div>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 border-t border-border">
                      <button onClick={() => removeFromCart(cart[0].id, cart[0].size)} className="px-6 py-3 sm:py-2 border border-border text-xs font-bold uppercase tracking-wider rounded hover:bg-muted transition-colors text-center">Remove</button>
                      <button onClick={() => { handleToggleWishlist(cart[0].id); removeFromCart(cart[0].id, cart[0].size); }} className="px-6 py-3 sm:py-2 border border-border text-xs font-bold uppercase tracking-wider rounded hover:bg-muted transition-colors text-center">Move To Wishlist</button>
                    </div>
                  </div>
                </>
              )}

              {step === "ADDRESS" && (
                <div className="bg-background shadow-sm rounded-sm p-6">
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Delivery To</h2>
                  
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="w-full border border-border text-teal-600 font-bold p-4 flex items-center space-x-2 text-sm hover:bg-teal-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>

                  <div className="mt-6 space-y-4">
                    {addresses && addresses.length > 0 ? addresses.map((addr, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`border p-4 rounded cursor-pointer ${selectedAddressIndex === idx ? 'border-teal-600 bg-teal-50/30' : 'border-border'}`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                           <input type="radio" checked={selectedAddressIndex === idx} readOnly className="accent-teal-600" />
                           <span className="font-bold text-sm">{user?.name}</span>
                           <span className="bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded">Home</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-7">{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No saved addresses.</p>
                    )}
                  </div>
                </div>
              )}

              {step === "PAYMENT" && (
                <div className="space-y-6">
                  <div className="bg-background shadow-sm rounded-sm p-6 flex justify-between items-center">
                     <div>
                       <h3 className="font-bold text-sm text-teal-600 mb-1">Deliver To: {user?.name}, {addresses[selectedAddressIndex]?.postalCode}</h3>
                       <p className="text-xs text-muted-foreground">{addresses[selectedAddressIndex]?.street}, {addresses[selectedAddressIndex]?.city}</p>
                     </div>
                     <button onClick={() => setStep("ADDRESS")} className="text-xs font-bold text-teal-600 uppercase tracking-widest">Change</button>
                  </div>

                  <div className="bg-background shadow-sm rounded-sm overflow-hidden">
                    <h3 className="text-sm font-bold p-4 border-b border-border bg-muted/20">Payment Options</h3>
                    
                    <div className="divide-y divide-border">
                      {["TSS Money", "Pay with any UPI App", "Wallets", "Credit & Debit Cards", "Netbanking", "CRED pay", "COD"].map((method) => (
                        <div 
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === method ? 'bg-teal-50/50' : 'hover:bg-muted/30'}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              {method === "Credit & Debit Cards" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> : <div className="w-4 h-4 bg-muted-foreground/30 rounded-full"></div>}
                            </div>
                            <span className="text-sm font-bold">{method}</span>
                          </div>
                          <input type="radio" checked={paymentMethod === method} readOnly className="accent-teal-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                
                {step === "BAG" && (
                  <div className="bg-background shadow-sm rounded-sm divide-y divide-border">
                    {/* Coupons */}
                    <div className="border-b border-border">
                       <button onClick={() => setCouponOpen(!couponOpen)} className="w-full p-4 flex justify-between items-center text-sm font-bold hover:bg-muted/30 transition-colors">
                         <div className="flex items-center space-x-2"><Tag className="w-4 h-4 opacity-70" /><span>Apply Coupon</span></div>
                         {couponOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                       </button>
                       {couponOpen && !appliedCoupon && (
                         <div className="p-4 pt-0 flex space-x-2">
                           <input type="text" value={couponCodeInput} onChange={e => setCouponCodeInput(e.target.value.toUpperCase())} placeholder="Enter Code" className="flex-1 border border-border p-2 text-sm rounded focus:outline-none focus:border-teal-600" />
                           <button onClick={handleApplyCoupon} className="bg-teal-600 text-white px-4 text-sm font-bold rounded hover:bg-teal-700">Apply</button>
                         </div>
                       )}
                       {couponOpen && appliedCoupon && (
                         <div className="p-4 pt-0 flex justify-between items-center bg-teal-50 border border-teal-200 mx-4 mb-4 rounded px-3 py-2">
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-teal-700">{appliedCoupon.code} Applied!</span>
                             <span className="text-xs text-teal-600">You saved {appliedCoupon.discountPercentage}%</span>
                           </div>
                           <button onClick={() => setAppliedCoupon(null)} className="text-xs font-bold text-red-500 hover:underline uppercase tracking-widest">
                             Remove
                           </button>
                         </div>
                       )}
                       {couponError && !appliedCoupon && <div className="px-4 pb-4 text-xs text-red-500">{couponError}</div>}
                    </div>
                    {/* Vouchers */}
                    <button className="w-full p-4 flex justify-between items-center text-sm font-bold hover:bg-muted/30 transition-colors">
                       <div className="flex items-center space-x-2"><Gift className="w-4 h-4 opacity-70" /><span>Gift Voucher</span></div>
                       <ChevronDown className="w-4 h-4" />
                    </button>
                    {/* TSS Money */}
                    <button className="w-full p-4 flex justify-between items-center text-sm font-bold hover:bg-muted/30 transition-colors">
                       <div className="flex items-center space-x-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle></svg><span>TSS Money / TSS Points</span></div>
                       <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="shadow-sm rounded-sm overflow-hidden">
                  <BillingDetails />
                  
                  {step === "BAG" && (
                    <button onClick={() => setStep("ADDRESS")} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 text-sm tracking-wide transition-colors uppercase">
                      Place Order
                    </button>
                  )}
                  {step === "ADDRESS" && (
                    <button onClick={() => {
                      if (!addresses || addresses.length === 0) {
                        alert("Please add and select a delivery address first.");
                        return;
                      }
                      setStep("PAYMENT");
                    }} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 text-sm tracking-wide transition-colors uppercase">
                      Continue to Payment
                    </button>
                  )}
                  {step === "PAYMENT" && (
                    <button disabled={isPlacingOrder} onClick={handlePlaceOrder} className={`w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 text-sm tracking-wide transition-colors uppercase flex justify-center items-center ${isPlacingOrder ? 'opacity-70 cursor-wait' : ''}`}>
                      {isPlacingOrder ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : "Confirm Order"}
                    </button>
                  )}
                </div>

                {step === "ADDRESS" && (
                  <div className="mt-8 text-center border border-border bg-white p-8 rounded">
                     <div className="bg-red-600 text-white py-2 font-bold text-lg -mt-8 -mx-8 mb-4">HOMEGROWN INDIAN BRAND</div>
                     <h3 className="text-2xl font-bold">Over 6 Million <span className="font-normal">Happy Customers</span></h3>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
             <div className="flex justify-between items-center p-4 border-b border-border">
               <div className="flex items-center space-x-2 font-bold text-lg text-foreground">
                 <button onClick={() => setShowAddressModal(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
                 <span>Add New Address</span>
               </div>
               <button onClick={() => setShowAddressModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
             </div>
             <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto bg-gray-50/50">
               <div className="relative">
                 <input type="text" placeholder="Flat No / Building / Company*" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full border border-border p-3 rounded text-sm focus:border-teal-600 focus:outline-none" />
               </div>
               <div className="relative">
                 <input type="text" placeholder="Locality / Area / Street*" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full border border-border p-3 rounded text-sm focus:border-teal-600 focus:outline-none" />
               </div>
               <div className="relative">
                 <input type="text" placeholder="Landmark" className="w-full border border-border p-3 rounded text-sm focus:border-teal-600 focus:outline-none" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <input type="text" placeholder="Pincode*" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full border border-border p-3 rounded text-sm focus:border-teal-600 focus:outline-none" />
                 <input type="text" placeholder="City*" value={newAddress.city} readOnly className="w-full border border-border p-3 rounded text-sm bg-muted/50 cursor-not-allowed" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <input type="text" placeholder="State*" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full border border-border p-3 rounded text-sm focus:border-teal-600 focus:outline-none" />
                 <input type="text" placeholder="Country*" value={newAddress.country} readOnly className="w-full border border-border p-3 rounded text-sm bg-muted/50 cursor-not-allowed" />
               </div>

               <h4 className="font-bold text-sm pt-2 text-foreground">Contact Details</h4>
               <input type="text" placeholder="Name" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="w-full border border-border p-3 rounded text-sm focus:border-teal-600 focus:outline-none" />
               <div className="flex">
                 <select className="border border-border p-3 rounded-l text-sm bg-transparent focus:outline-none border-r-0"><option>+91</option></select>
                 <input type="text" placeholder="Phone Number*" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="flex-1 border border-border p-3 rounded-r text-sm focus:border-teal-600 focus:outline-none" />
               </div>

               <h4 className="font-bold text-sm pt-2 text-foreground">Save Address As</h4>
               <div className="flex space-x-2">
                 {["Home", "Work", "Other"].map(type => (
                   <button key={type} onClick={() => setNewAddress({...newAddress, type})} className={`px-4 py-1.5 border rounded-full text-xs font-bold ${newAddress.type === type ? 'border-teal-600 text-teal-600 bg-teal-50/50' : 'border-border text-muted-foreground'}`}>{type}</button>
                 ))}
               </div>
               <label className="flex items-center space-x-2 mt-4 cursor-pointer text-sm">
                 <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="accent-teal-600 w-4 h-4 rounded" />
                 <span className="font-bold text-foreground">Save This As Default Address</span>
               </label>
             </div>
             <div className="p-4 border-t border-border flex justify-end space-x-4 bg-white">
               <button onClick={() => setShowAddressModal(false)} className="px-6 py-2 border border-border rounded font-bold text-sm">Cancel</button>
               <button onClick={saveNewAddress} className="px-6 py-2 bg-[#F14633] text-white rounded font-bold text-sm">Save</button>
             </div>
          </div>
        </div>
      )}

    {/* Success Modal */}
      <PaymentSuccessModal isOpen={showSuccessModal} orderId={placedOrderId} />

    </div>
  );
}
