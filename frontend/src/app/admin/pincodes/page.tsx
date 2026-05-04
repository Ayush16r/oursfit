"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminPincodes() {
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingPincode, setAddingPincode] = useState(false);
  const [newPincode, setNewPincode] = useState({ pincode: "", deliveryDays: 5, isDeliverable: true });
  const { user } = useStore();

  const fetchPincodes = useCallback(async () => {
    setRefreshing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get(`${API_URL}/pincodes`, config);
      setPincodes(data);
    } catch (error) {
      console.error("Error fetching pincodes", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.token) {
      fetchPincodes();
    }
  }, [fetchPincodes, user]);

  const savePincode = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post(`${API_URL}/pincodes`, newPincode, config);
      setAddingPincode(false);
      setNewPincode({ pincode: "", deliveryDays: 5, isDeliverable: true });
      fetchPincodes();
    } catch (error) {
      console.error("Error adding pincode", error);
      alert("Failed to create pincode. Maybe it exists?");
    }
  };

  const deletePincode = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this pincode?")) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`${API_URL}/pincodes/${id}`, config);
      fetchPincodes();
    } catch (error) {
      console.error("Error deleting pincode", error);
      alert("Failed to delete pincode.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Pincodes</h1>
          <p className="text-sm opacity-70 uppercase tracking-widest">Manage delivery areas</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={fetchPincodes}
            disabled={refreshing}
            className="p-2 border border-border hover:bg-muted transition-colors rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setAddingPincode(true)} className="btn-primary flex items-center space-x-2 py-2 text-sm">
            <Plus className="w-4 h-4" />
            <span>Add Pincode</span>
          </button>
        </div>
      </div>

      <div className="bg-background border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Pincode</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Delivery Days</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Deliverable</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {addingPincode && (
                <tr className="bg-muted/30">
                  <td className="p-4"><input type="text" value={newPincode.pincode} onChange={(e) => setNewPincode({...newPincode, pincode: e.target.value})} placeholder="751030" className="w-full bg-transparent border-b border-border focus:outline-none" /></td>
                  <td className="p-4"><input type="number" value={newPincode.deliveryDays} onChange={(e) => setNewPincode({...newPincode, deliveryDays: Number(e.target.value)})} className="w-full bg-transparent border-b border-border focus:outline-none" /></td>
                  <td className="p-4">
                    <input type="checkbox" checked={newPincode.isDeliverable} onChange={(e) => setNewPincode({...newPincode, isDeliverable: e.target.checked})} className="accent-foreground" />
                  </td>
                  <td className="p-4 text-right flex justify-end space-x-2">
                    <button onClick={savePincode} className="p-2 bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors rounded text-xs font-bold uppercase">Save</button>
                    <button onClick={() => setAddingPincode(false)} className="p-2 bg-muted hover:bg-muted/80 transition-colors rounded text-xs font-bold uppercase">Cancel</button>
                  </td>
                </tr>
              )}
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center opacity-50">Loading pincodes...</td>
                </tr>
              ) : pincodes.length === 0 && !addingPincode ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center opacity-50">No pincodes found.</td>
                </tr>
              ) : pincodes.map((p: any) => (
                <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-bold text-sm">{p.pincode}</td>
                  <td className="p-4 text-sm font-bold">{p.deliveryDays}</td>
                  <td className="p-4 text-sm font-bold text-green-500">{p.isDeliverable ? "Yes" : "No"}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deletePincode(p._id)}
                      className="p-2 hover:bg-red-500/10 text-red-500 transition-colors rounded tooltip" 
                      title="Delete Pincode"
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
