"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import axios from "axios";
import { CheckCircle, Clock, Truck, Package, ChevronLeft, MapPin, CreditCard } from "lucide-react";
import { getImageUrl } from "@/utils/getImageUrl";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backends.onrender.com/api';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { user } = useStore();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryDays, setDeliveryDays] = useState(5); // fallback

  useEffect(() => {
    if (!user?.token) {
      router.push("/auth/login");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/orders/${orderId}`, config);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order details", error);
      }
    };

    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/settings`);
        if (data && data.deliveryDays) setDeliveryDays(data.deliveryDays);
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };

    Promise.all([fetchOrderDetails(), fetchSettings()]).finally(() => {
      setLoading(false);
    });
  }, [orderId, user, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest opacity-50">Loading order details...</div>;
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest opacity-50">Order not found</div>;
  }

  // Calculate expected delivery date (+ deliveryDays from createdAt)
  const deliveryDate = new Date(order.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

  const steps = [
    { label: "Order Placed", status: "Pending", icon: Clock },
    { label: "Confirmed", status: "Confirmed", icon: CheckCircle },
    { label: "Shipped", status: "Shipped", icon: Truck },
    { label: "Out for Delivery", status: "Out for Delivery", icon: Truck },
    { label: "Delivered", status: "Delivered", icon: Package },
  ];

  const currentStepIndex = Math.max(steps.findIndex(s => s.status.toLowerCase() === order.status?.toLowerCase()), 0);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen max-w-4xl bg-white">
      <Link href="/profile" className="inline-flex items-center text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tighter mb-2">Order Details</h1>
          <p className="text-sm opacity-70 uppercase tracking-widest">Order #{order._id}</p>
          <p className="text-xs opacity-50 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="mt-4 md:mt-0 text-left md:text-right">
          <p className="text-sm opacity-70 uppercase tracking-widest mb-1">Total Amount</p>
          <p className="text-2xl font-black text-black">₹ {order.totalPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white border border-border p-6 mb-8 rounded shadow-sm">
        <h2 className="text-lg font-bold uppercase tracking-widest mb-6">Order Status</h2>
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100 absolute top-5 left-0 right-0 z-0">
             <div style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-black transition-all duration-500"></div>
          </div>
          <div className="flex justify-between relative z-10">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-black border-gray-200 text-white' : 'bg-white border-gray-100 text-gray-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-center mt-2 w-20 md:w-24">
                    <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${isCompleted ? 'text-black' : 'text-gray-400'}`}>{step.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-8 text-center bg-gray-50 py-3 rounded text-black text-sm font-bold uppercase tracking-widest border border-gray-200">
          Expected Delivery: {deliveryDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Shipping Info */}
        <div className="bg-white border border-border p-6 rounded shadow-sm">
           <div className="flex items-center space-x-2 mb-4 text-black">
             <MapPin className="w-5 h-5" />
             <h2 className="text-lg font-bold uppercase tracking-widest">Shipping Address</h2>
           </div>
           <p className="font-bold text-sm mb-1">{order.shippingAddress.fullName || user?.name || "Customer"}</p>
           <p className="text-sm opacity-80 leading-relaxed">
             {order.shippingAddress.address}<br />
             {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
             {order.shippingAddress.country}
           </p>
           <p className="text-sm mt-2 opacity-80">Phone: {order.shippingAddress.phone || "N/A"}</p>
        </div>

        {/* Payment Info */}
        <div className="bg-white border border-border p-6 rounded shadow-sm">
           <div className="flex items-center space-x-2 mb-4 text-black">
             <CreditCard className="w-5 h-5" />
             <h2 className="text-lg font-bold uppercase tracking-widest">Payment Method</h2>
           </div>
           <p className="font-bold text-sm mb-1">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</p>
           <div className="mt-4 p-3 bg-muted rounded flex items-center justify-between">
              <span className="text-sm font-bold uppercase">Status</span>
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                 {order.isPaid ? 'Paid' : 'Pending'}
              </span>
           </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white border border-border p-6 rounded shadow-sm">
        <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-border pb-4">Items in Order</h2>
        <div className="space-y-6">
          {order.orderItems.map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-4 border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="w-20 h-24 relative bg-muted shrink-0 rounded overflow-hidden">
                <img 
                  src={item.image ? getImageUrl(item.image) : "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800"} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm uppercase tracking-wider mb-1 line-clamp-1">
                  <Link href={`/product/${item.product}`} className="hover:text-gray-600 transition-colors">{item.name}</Link>
                </h3>
                <p className="text-xs opacity-70 mb-2">Size: <span className="font-bold">{item.size || "N/A"}</span></p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm font-black text-black">₹ {item.price}</p>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50">Qty: {item.qty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
