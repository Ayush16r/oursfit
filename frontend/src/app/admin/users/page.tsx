"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminUsersPage() {
  const { user } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // In a real app we'd have a /api/users endpoint. Let's assume it exists or we show mock data if it fails.
      const { data } = await axios.get(`${API_URL}/users`, config);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      // Fallback to empty if endpoint doesn't exist yet
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#2d2d2d]">Users</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Manage Registered Customers</p>
        </div>
        <button onClick={fetchUsers} className="p-2 border border-border rounded hover:bg-muted transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21v-5h5"></path></svg>
        </button>
      </div>

      <div className="bg-white border border-border rounded-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="p-4 font-bold uppercase tracking-widest text-[#2d2d2d] text-xs">Name</th>
              <th className="p-4 font-bold uppercase tracking-widest text-[#2d2d2d] text-xs">Email</th>
              <th className="p-4 font-bold uppercase tracking-widest text-[#2d2d2d] text-xs">Role</th>
              <th className="p-4 font-bold uppercase tracking-widest text-[#2d2d2d] text-xs">Member Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground uppercase tracking-widest">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground uppercase tracking-widest">No users found. (API might need implementation)</td></tr>
            ) : (
              users.map((u: any) => (
                <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.isMember ? (
                       <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded bg-green-100 text-green-700">Member</span>
                    ) : (
                       <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
