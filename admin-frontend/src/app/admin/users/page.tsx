"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { Search, RefreshCw, Mail, ShieldAlert } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminUsersPage() {
  const { user } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // the backend getUsersAdmin is available at /api/auth
      const { data } = await axios.get(`${API_URL}/auth`, config);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
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
          <p className="text-sm opacity-70 uppercase tracking-widest">Manage registered users and view their lifetime value</p>
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
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Spent</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Joined</th>
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
                          {u.name.charAt(0).toUpperCase()}
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
                    <td className="p-4 text-xs uppercase tracking-widest opacity-70">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-accent hover:text-white text-foreground/70 transition-colors rounded-lg" title="Email User">
                          <Mail className="w-4 h-4" />
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
    </div>
  );
}
