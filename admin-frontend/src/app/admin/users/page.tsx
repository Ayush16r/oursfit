"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { Search, RefreshCw, Mail, ShieldAlert, Edit2, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminUsersPage() {
  const { user } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit Modal State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/auth`, config);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser({ ...u });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const payload = {
        role: editingUser.role,
        tssMoney: Number(editingUser.tssMoney),
        tssPoints: Number(editingUser.tssPoints)
      };
      await axios.put(`${API_URL}/auth/admin/users/${editingUser._id}`, payload, config);
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user", error);
      alert("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u: any) => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Customers</h1>
          <p className="text-sm opacity-70 uppercase tracking-widest">Manage registered users, roles, and TSS points</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="p-3 glass rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-foreground/70 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/30">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Orders</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">LTV / Spent</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">TSS Money / Pts</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground font-bold uppercase tracking-widest">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading Customers...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <p className="font-bold uppercase tracking-widest">No customers found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => (
                  <tr key={u._id} className="hover:bg-muted/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                          u.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 
                          'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {u.role}
                        </span>
                        {u.isMember && (
                           <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                             Member
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold">{u.orderCount || 0}</td>
                    <td className="p-4 font-bold text-accent">₹{u.totalSpent?.toFixed(2) || '0.00'}</td>
                    <td className="p-4">
                       <div className="text-xs font-bold text-green-500">₹{u.tssMoney || 0}</div>
                       <div className="text-xs font-bold text-orange-500">{u.tssPoints || 0} Pts</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(u)} className="p-2 hover:bg-accent hover:text-white text-foreground/70 transition-colors rounded-lg" title="Edit User">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.role !== 'admin' && (
                          <button className="p-2 hover:bg-destructive hover:text-white text-foreground/70 transition-colors rounded-lg" title="Suspend User">
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isModalOpen && editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                <h2 className="text-lg font-bold uppercase tracking-widest">Edit Customer</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                <div className="mb-4">
                   <p className="font-bold text-lg">{editingUser.name}</p>
                   <p className="text-xs text-muted-foreground uppercase tracking-widest">{editingUser.email}</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Role</label>
                  <select 
                    value={editingUser.role} 
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none text-foreground"
                  >
                    <option className="bg-background text-foreground" value="user">User</option>
                    <option className="bg-background text-foreground" value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">TSS Money (Wallet Balance in ₹)</label>
                  <input 
                    type="number" 
                    value={editingUser.tssMoney || 0} 
                    onChange={e => setEditingUser({...editingUser, tssMoney: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">TSS Points (Loyalty Points)</label>
                  <input 
                    type="number" 
                    value={editingUser.tssPoints || 0} 
                    onChange={e => setEditingUser({...editingUser, tssPoints: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6"
                >
                  {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
