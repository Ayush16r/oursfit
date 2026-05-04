"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingCoupon, setAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", discountPercentage: 10, expiryDate: "" });
  const { user } = useStore();

  const fetchCoupons = useCallback(async () => {
    setRefreshing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get(`${API_URL}/coupons`, config);
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.token) {
      fetchCoupons();
    }
  }, [fetchCoupons, user]);

  const saveCoupon = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post(`${API_URL}/coupons`, newCoupon, config);
      setAddingCoupon(false);
      setNewCoupon({ code: "", discountPercentage: 10, expiryDate: "" });
      fetchCoupons();
    } catch (error) {
      console.error("Error adding coupon", error);
      alert("Failed to create coupon.");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`${API_URL}/coupons/${id}`, config);
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon", error);
      alert("Failed to delete coupon.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Coupons</h1>
          <p className="text-sm opacity-70 uppercase tracking-widest">Manage discount codes</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={fetchCoupons}
            disabled={refreshing}
            className="p-2 border border-border hover:bg-muted transition-colors rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setAddingCoupon(true)} className="btn-primary flex items-center space-x-2 py-2 text-sm">
            <Plus className="w-4 h-4" />
            <span>Add Coupon</span>
          </button>
        </div>
      </div>

      <div className="bg-background border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Code</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Discount (%)</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Expiry</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {addingCoupon && (
                <tr className="bg-muted/30">
                  <td className="p-4"><input type="text" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} placeholder="CODE" className="w-full bg-transparent border-b border-border focus:outline-none uppercase" /></td>
                  <td className="p-4"><input type="number" value={newCoupon.discountPercentage} onChange={(e) => setNewCoupon({...newCoupon, discountPercentage: Number(e.target.value)})} className="w-full bg-transparent border-b border-border focus:outline-none" /></td>
                  <td className="p-4"><input type="date" value={newCoupon.expiryDate} onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})} className="w-full bg-transparent border-b border-border focus:outline-none" /></td>
                  <td className="p-4 text-right flex justify-end space-x-2">
                    <button onClick={saveCoupon} className="p-2 bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors rounded text-xs font-bold uppercase">Save</button>
                    <button onClick={() => setAddingCoupon(false)} className="p-2 bg-muted hover:bg-muted/80 transition-colors rounded text-xs font-bold uppercase">Cancel</button>
                  </td>
                </tr>
              )}
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center opacity-50">Loading coupons...</td>
                </tr>
              ) : coupons.length === 0 && !addingCoupon ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center opacity-50">No coupons found.</td>
                </tr>
              ) : coupons.map((coupon: any) => (
                <tr key={coupon._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-bold text-sm uppercase">{coupon.code}</td>
                  <td className="p-4 text-sm font-bold">{coupon.discountPercentage}%</td>
                  <td className="p-4 text-sm opacity-70">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deleteCoupon(coupon._id)}
                      className="p-2 hover:bg-red-500/10 text-red-500 transition-colors rounded tooltip" 
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
