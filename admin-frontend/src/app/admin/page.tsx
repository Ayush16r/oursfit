"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, DollarSign, Users } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { getImageUrl } from "@/utils/getImageUrl";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const { user } = useStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
        const [ordersRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/orders`, config),
          axios.get(`${API_URL}/products`)
        ]);
        
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error("Error fetching admin dashboard data", error);
      }
    };

    if (user?.token) {
      fetchOrders();
    }
  }, [user]);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.isPaid ? order.totalPrice : 0), 0);
  const recentOrders = orders.slice(0, 5);
  
  const stats = [
    { name: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: DollarSign, change: "Live" },
    { name: "Orders", value: orders.length.toString(), icon: ShoppingCart, change: "Live" },
    { name: "Products", value: products.length.toString(), icon: Package, change: "Live" },
    { name: "Active Users", value: "2", icon: Users, change: "Live" }, // Placeholder for users
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Dashboard</h1>
        <p className="text-sm opacity-70 uppercase tracking-widest">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-background p-6 border border-border">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-muted rounded-full">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-1">{stat.name}</h3>
              <p className="text-3xl font-extrabold tracking-tighter">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background border border-border p-6">
          <h2 className="text-xl font-bold uppercase tracking-tighter mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-sm opacity-50">No recent orders.</p>
            ) : recentOrders.map((order: any) => (
              <div key={order._id} className="flex justify-between items-center pb-4 border-b border-border last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-sm mb-1">Order #{order._id.substring(0, 8)}</p>
                  <p className="text-xs opacity-70">{order.user?.name || "Unknown"} • {order.orderItems?.length || 0} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm mb-1">₹{order.totalPrice?.toFixed(2)}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-green-500/20 text-green-600'}`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background border border-border p-6">
          <h2 className="text-xl font-bold uppercase tracking-tighter mb-6">Top Products</h2>
          <div className="space-y-4">
            {products.slice(0, 3).map((product: any) => (
              <div key={product._id} className="flex justify-between items-center pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted relative">
                    <img src={getImageUrl(product.images && product.images[0] ? product.images[0] : undefined)} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1">{product.name}</p>
                    <p className="text-xs opacity-70">{product.stock} in stock</p>
                  </div>
                </div>
                <p className="font-bold text-sm">₹{product.price.toFixed(2)}</p>
              </div>
            ))}
            {products.length === 0 && <p className="text-sm opacity-50">No products available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
