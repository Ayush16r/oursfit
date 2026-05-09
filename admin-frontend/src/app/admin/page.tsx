"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, DollarSign, Users, RefreshCw } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { getImageUrl } from "@/utils/getImageUrl";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get(`${API_URL}/analytics`, config);
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="h-[60vh] flex items-center justify-center text-muted-foreground uppercase tracking-widest font-bold">
      <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Loading Analytics...
    </div>;
  }

  if (!analytics) return <div className="p-8 text-center opacity-50">Failed to load analytics data</div>;

  const stats = [
    { name: "Total Revenue", value: `₹${analytics.overview.totalRevenue.toFixed(2)}`, icon: DollarSign },
    { name: "Total Orders", value: analytics.overview.totalOrders.toString(), icon: ShoppingCart },
    { name: "Customers", value: analytics.overview.totalCustomers.toString(), icon: Users },
    { name: "Products", value: analytics.overview.totalProducts.toString(), icon: Package },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Dashboard</h1>
        <p className="text-sm opacity-70 uppercase tracking-widest">Overview of your store performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-panel p-6 border border-border/50 rounded-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-muted rounded-full text-foreground/70 group-hover:text-foreground transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-1 relative z-10">{stat.name}</h3>
              <p className="text-3xl font-extrabold tracking-tighter relative z-10">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border border-border/50 rounded-xl">
          <h2 className="text-sm font-bold uppercase tracking-widest text-accent mb-6">Revenue Over Time</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.salesByMonth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} opacity={0.5} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" fontSize={12} opacity={0.5} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 border border-border/50 rounded-xl">
          <h2 className="text-sm font-bold uppercase tracking-widest text-accent mb-6">Orders by Month</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.salesByMonth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} opacity={0.5} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" fontSize={12} opacity={0.5} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel border border-border/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Recent Orders</h2>
          </div>
          <div className="p-0">
            {analytics.recentOrders.length === 0 ? (
              <p className="p-6 text-sm opacity-50 text-center font-bold uppercase tracking-widest">No recent orders</p>
            ) : (
              <div className="divide-y divide-border/50">
                {analytics.recentOrders.map((order: any) => (
                  <div key={order._id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div>
                      <p className="font-bold text-sm">#{order._id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                        {order.user?.name || "Guest"} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{order.totalPrice?.toFixed(2)}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${
                        order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel border border-border/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Top Selling Products</h2>
          </div>
          <div className="p-0">
            {analytics.topProducts.length === 0 ? (
              <p className="p-6 text-sm opacity-50 text-center font-bold uppercase tracking-widest">No products sold yet</p>
            ) : (
              <div className="divide-y divide-border/50">
                {analytics.topProducts.map((product: any, idx: number) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                          {product.totalSold} Units Sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Revenue</p>
                      <p className="font-bold text-accent">₹{product.revenue?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
