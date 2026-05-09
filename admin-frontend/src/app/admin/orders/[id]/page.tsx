"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Truck, Package as PackageIcon, CheckCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { getImageUrl } from "@/utils/getImageUrl";
import { cn } from "@/utils/cn";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useStore();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [status, setStatus] = useState("pending");
  const [trackingId, setTrackingId] = useState("");
  const [courierPartner, setCourierPartner] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user?.token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/orders/${id}`, config);
        setOrder(data);
        setStatus(data.status || 'pending');
        setTrackingId(data.trackingId || '');
        setCourierPartner(data.courierPartner || '');
        setDeliveryNotes(data.deliveryNotes || '');
        setEstimatedDelivery(data.estimatedDelivery ? new Date(data.estimatedDelivery).toISOString().split('T')[0] : '');
      } catch (error) {
        console.error("Error fetching order", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const payload = {
        status,
        trackingId,
        courierPartner,
        deliveryNotes,
        estimatedDelivery
      };
      
      const { data } = await axios.put(`${API_URL}/orders/${id}/status`, payload, config);
      setOrder(data);
      alert("Order updated successfully");
    } catch (error) {
      console.error("Error updating order", error);
      alert("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'shipped': 
      case 'out for delivery': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  if (loading) {
    return <div className="p-12 text-center opacity-50 flex items-center justify-center">
      <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading...
    </div>;
  }

  if (!order) return <div className="p-12 text-center opacity-50">Order not found</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tighter flex items-center gap-3">
            Order #{order._id.substring(0, 8)}
            <span className={cn("text-[10px] px-3 py-1 rounded-full border", getStatusColor(order.status))}>
              {order.status || 'pending'}
            </span>
          </h1>
          <p className="text-sm opacity-70 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Details */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="glass-panel p-6 border border-border/50 rounded-xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-accent border-b border-border/50 pb-2">Items</h2>
            <div className="space-y-4">
              {order.orderItems?.map((item: any, i: number) => (
                <div key={i} className="flex space-x-4 p-4 border border-border/50 rounded-lg bg-background/50 hover:bg-muted/10 transition-colors">
                  <div className="w-20 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex justify-between">
                    <div>
                      <p className="font-bold text-base">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Size: {item.size}</p>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Qty: {item.qty}</p>
                    </div>
                    <p className="font-bold">₹ {(item.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-border/50 flex flex-col items-end text-sm">
              <div className="flex justify-between w-64 mb-2"><span className="opacity-70">Subtotal:</span> <span>₹ {order.itemsPrice?.toFixed(2) || 0}</span></div>
              <div className="flex justify-between w-64 mb-2"><span className="opacity-70">Shipping:</span> <span>₹ {order.shippingPrice?.toFixed(2) || 0}</span></div>
              <div className="flex justify-between w-64 mb-2"><span className="opacity-70">Tax:</span> <span>₹ {order.taxPrice?.toFixed(2) || 0}</span></div>
              <div className="flex justify-between w-64 font-bold text-lg mt-2 pt-2 border-t border-border/50">
                <span>Total:</span> <span className="text-accent">₹ {order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Timeline / History */}
          <div className="glass-panel p-6 border border-border/50 rounded-xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-accent border-b border-border/50 pb-2">Timeline</h2>
            <div className="space-y-6 pl-4 border-l-2 border-muted">
              {order.timeline?.map((event: any, i: number) => (
                <div key={i} className="relative pl-6">
                  <span className="absolute -left-[1.35rem] top-1 w-4 h-4 rounded-full bg-background border-2 border-accent"></span>
                  <p className="font-bold uppercase tracking-widest text-sm">{event.status}</p>
                  <p className="text-xs opacity-70">{new Date(event.date).toLocaleString()}</p>
                  {event.description && <p className="text-sm mt-1 bg-muted/20 p-2 rounded inline-block">{event.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col - Admin Controls & Customer info */}
        <div className="space-y-8">
          
          <div className="glass-panel p-6 border border-border/50 rounded-xl space-y-6 bg-accent/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
            
             <h2 className="text-sm font-bold uppercase tracking-widest text-accent border-b border-border/50 pb-2 relative z-10 flex items-center justify-between">
               Fulfillment Controls
               <Truck className="w-4 h-4 opacity-50" />
             </h2>
             
             <div className="space-y-4 relative z-10">
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Status</label>
                 <select 
                   value={status} 
                   onChange={(e) => setStatus(e.target.value)}
                   className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none font-bold uppercase tracking-widest"
                 >
                   <option value="pending">Pending</option>
                   <option value="confirmed">Confirmed</option>
                   <option value="processing">Processing</option>
                   <option value="packed">Packed</option>
                   <option value="shipped">Shipped</option>
                   <option value="out for delivery">Out for Delivery</option>
                   <option value="delivered">Delivered</option>
                   <option value="cancelled">Cancelled</option>
                 </select>
               </div>
               
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Tracking ID</label>
                 <input 
                   type="text" 
                   value={trackingId} 
                   onChange={(e) => setTrackingId(e.target.value)}
                   placeholder="e.g. AWB123456789"
                   className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" 
                 />
               </div>
               
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Courier Partner</label>
                 <input 
                   type="text" 
                   value={courierPartner} 
                   onChange={(e) => setCourierPartner(e.target.value)}
                   placeholder="e.g. Delhivery, Bluedart"
                   className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" 
                 />
               </div>
               
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Est. Delivery Date</label>
                 <input 
                   type="date" 
                   value={estimatedDelivery} 
                   onChange={(e) => setEstimatedDelivery(e.target.value)}
                   className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" 
                 />
               </div>
               
               <button 
                 onClick={handleUpdate} 
                 disabled={saving}
                 className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-4"
               >
                 {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Update Order
               </button>
             </div>
          </div>

          <div className="glass-panel p-6 border border-border/50 rounded-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-accent border-b border-border/50 pb-2">Customer Info</h2>
            <div className="text-sm space-y-2">
              <p className="font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> {order.user?.name}</p>
              <p className="opacity-70">{order.user?.email}</p>
              <p className="opacity-70">{order.shippingAddress?.phone || 'No phone provided'}</p>
            </div>
          </div>
          
          <div className="glass-panel p-6 border border-border/50 rounded-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-accent border-b border-border/50 pb-2">Shipping Address</h2>
            <div className="text-sm space-y-1">
              <p className="font-bold">{order.shippingAddress?.fullName || order.user?.name}</p>
              <p>{order.shippingAddress?.address || order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
