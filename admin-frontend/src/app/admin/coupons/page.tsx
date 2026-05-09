"use client";

import { useState, useEffect } from "react";
import { Plus, Ticket, Search, Trash2, Edit2, RefreshCw } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminCouponsPage() {
  const { user } = useStore();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCoupons = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/coupons`, config);
      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [user]);

  const deleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`${API_URL}/coupons/${id}`, config);
      fetchCoupons();
    } catch (error) {
      alert("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Coupons</h1>
          <p className="text-sm opacity-70 uppercase tracking-widest">Manage discount codes and promotions</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchCoupons} className="p-3 glass rounded-lg hover:bg-muted/50 transition-colors">
            <RefreshCw className={`w-5 h-5 text-foreground/70 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search coupons by code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/30">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Code</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Discount</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Usage</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Expiry</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground font-bold uppercase tracking-widest">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <Ticket className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest">No coupons found</p>
                  </td>
                </tr>
              ) : (
                coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase())).map((c: any) => (
                  <tr key={c._id} className="hover:bg-muted/20 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono font-bold bg-muted/50 px-2 py-1 rounded">{c.code}</span>
                    </td>
                    <td className="p-4 font-bold text-accent">{c.discountPercentage}% OFF</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                        c.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                        'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 font-bold opacity-70">
                      {c.usedCount || 0} / {c.usageLimit || '∞'}
                    </td>
                    <td className="p-4 text-xs uppercase tracking-widest opacity-70">
                      {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-accent hover:text-white text-foreground/70 transition-colors rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteCoupon(c._id)} className="p-2 hover:bg-destructive hover:text-white text-foreground/70 transition-colors rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
