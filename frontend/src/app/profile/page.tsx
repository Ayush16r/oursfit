"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Package, User, LogOut, MapPin, Gift, HelpCircle, Shield, Trash2, CreditCard, Coins } from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
  const { user, setUser } = useStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Orders");

  useEffect(() => {
    if (!user?.token) {
      router.push("/auth/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(`${API_URL}/orders/myorders`, config);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "Orders") {
      fetchOrders();
    }
  }, [user, router, activeTab]);

  const handleLogout = () => {
    setUser(null);
    router.push("/auth/login");
  };

  if (!user) return null; // Will redirect

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
          
          {/* User Info Box */}
          <div className="bg-[#f0f0f0] p-6 border-b-2 border-border">
            <h2 className="font-bold text-xl text-[#2d3446] mb-1">{user.name}</h2>
            <p className="text-[#6c757d] text-sm mb-4">{user.email}</p>
            {user.isMember && (
               <span className="text-[#F14633] text-xs font-bold">(Member)</span>
            )}
          </div>

          {/* Main Links */}
          <div className="bg-white border border-border">
            <button 
              onClick={() => setActiveTab("Orders")}
              className={`w-full text-left p-4 border-b border-border transition-colors flex justify-between items-center ${activeTab === "Orders" ? "bg-teal-50" : "hover:bg-muted/30"}`}
            >
              <span className={`text-lg ${activeTab === "Orders" ? "text-teal-600 font-bold" : "text-[#58595b]"}`}>Orders</span>
              <span className="text-xs text-muted-foreground">(Track your order here)</span>
            </button>
          </div>

          <div className="bg-white border border-border flex flex-col">
            <button 
              onClick={() => setActiveTab("Gift Vouchers")}
              className={`text-left p-4 border-b border-border transition-colors ${activeTab === "Gift Vouchers" ? "text-teal-600 font-bold bg-teal-50" : "text-[#58595b] hover:bg-muted/30"}`}
            >
              <span className="text-lg">Gift Vouchers</span>
            </button>
            <button 
              onClick={() => setActiveTab("TSS Points")}
              className={`text-left p-4 border-b border-border transition-colors flex items-center gap-2 ${activeTab === "TSS Points" ? "text-teal-600 font-bold bg-teal-50" : "text-[#58595b] hover:bg-muted/30"}`}
            >
              <span className="text-lg">TSS Points</span>
              <span className="text-xs text-teal-600">(Active TSS Points: 0.00)</span>
            </button>
            <button 
              onClick={() => setActiveTab("TSS Money")}
              className={`text-left p-4 border-b border-border transition-colors flex items-center gap-2 ${activeTab === "TSS Money" ? "text-teal-600 font-bold bg-teal-50" : "text-[#58595b] hover:bg-muted/30"}`}
            >
              <span className="text-lg">TSS Money</span>
              <span className="text-xs text-teal-600">(TSS Money Balance: ₹ 0.00)</span>
            </button>
            <button 
              onClick={() => setActiveTab("FAQs")}
              className={`text-left p-4 border-b border-border transition-colors ${activeTab === "FAQs" ? "text-teal-600 font-bold bg-teal-50" : "text-[#58595b] hover:bg-muted/30"}`}
            >
              <span className="text-lg">FAQs</span>
            </button>
            <button 
              onClick={() => setActiveTab("Profile")}
              className={`text-left p-4 border-b border-border transition-colors ${activeTab === "Profile" ? "text-teal-600 font-bold bg-teal-50" : "text-[#58595b] hover:bg-muted/30"}`}
            >
              <span className="text-lg">Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab("My Membership")}
              className={`text-left p-4 transition-colors ${activeTab === "My Membership" ? "text-[#F14633] font-bold bg-red-50" : "text-[#F14633] hover:bg-red-50/50"}`}
            >
              <span className="text-lg">My Membership</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 mt-4">
             <button className="w-full py-3 border border-[#F14633] text-[#F14633] font-bold text-sm tracking-widest hover:bg-[#F14633] hover:text-white transition-colors">
               DELETE MY ACCOUNT
             </button>
             <button onClick={handleLogout} className="w-full py-3 border border-[#F14633] text-[#F14633] font-bold text-sm tracking-widest hover:bg-[#F14633] hover:text-white transition-colors">
               LOGOUT
             </button>
          </div>

        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-white border border-border p-8 min-h-[500px]">
            {activeTab === "Orders" && (
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tighter mb-6 text-[#2d2d2d]">Order History</h2>
                {loading ? (
                  <p className="text-sm opacity-70 uppercase tracking-widest py-8">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-border">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm opacity-70 uppercase tracking-widest">No orders found.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order: any) => (
                      <div key={order._id} className="border border-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <p className="text-sm font-bold mb-1">Order #{order._id.substring(0, 8)}</p>
                          <p className="text-xs opacity-70 mb-2">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-muted text-[#2d2d2d]`}>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                        <div className="mt-4 md:mt-0 text-left md:text-right">
                          <p className="font-bold text-lg mb-2">₹ {order.totalPrice.toFixed(2)}</p>
                          <button onClick={() => alert(`Order details coming soon! Order ID: ${order._id}`)} className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:text-teal-600 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Profile" && (
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tighter mb-6 text-[#2d2d2d]">Account Details</h2>
                <form className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
                    <input type="text" defaultValue={user.name} className="w-full p-3 bg-transparent border border-border focus:border-foreground focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
                    <input type="email" defaultValue={user.email} disabled className="w-full p-3 bg-muted border border-border text-gray-500 cursor-not-allowed" />
                  </div>
                  <button type="button" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded transition-colors text-sm tracking-wide mt-4">Save Changes</button>
                </form>
              </div>
            )}

            {/* Placeholders for other tabs */}
            {["Gift Vouchers", "TSS Points", "TSS Money", "FAQs", "My Membership"].includes(activeTab) && (
              <div className="py-20 text-center">
                <h2 className="text-2xl font-bold text-[#2d3446] mb-4">{activeTab}</h2>
                <p className="text-muted-foreground text-sm">You have no active {activeTab.toLowerCase()} at the moment.</p>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
