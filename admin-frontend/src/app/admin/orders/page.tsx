"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, RefreshCw, CheckCircle } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

import { getImageUrl } from "@/utils/getImageUrl";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useStore();

  const fetchOrders = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setRefreshing(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/orders`, config);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching admin orders", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Initial fetch and set up polling for "real-time" sync
  useEffect(() => {
    if (user?.token) {
      fetchOrders();
      // Poll every 5 seconds silently
      const interval = setInterval(() => {
        fetchOrders(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchOrders, user]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`${API_URL}/orders/${id}/status`, { status: newStatus }, config);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order", error);
      alert("Failed to update order status.");
    }
  };

  const handlePrintLabel = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label - Order #${order._id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; margin: 0; }
            .label { border: 2px solid #000; padding: 20px; max-width: 600px; margin: 0 auto; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .title { font-size: 24px; font-weight: 900; letter-spacing: -1px; margin: 0; }
            .order-id { font-size: 14px; font-weight: bold; }
            .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-bottom: 10px; }
            .address { font-size: 16px; line-height: 1.5; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ccc; font-size: 14px; }
            th { text-transform: uppercase; font-size: 12px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">
              <h1 class="title">OURSFIT</h1>
              <div class="order-id">Order #${order._id.substring(0, 8)}</div>
            </div>
            
            <div class="section-title">Ship To</div>
            <div class="address">
              <strong>${order.shippingAddress?.fullName || order.user?.name || "Customer"}</strong><br>
              ${order.shippingAddress?.address || order.shippingAddress?.street}<br>
              ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}<br>
              ${order.shippingAddress?.country}<br>
              ${order.shippingAddress?.phone ? `Phone: ${order.shippingAddress.phone}` : ''}
            </div>

            <div class="section-title">Order Summary</div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Size</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems?.map((item: any) => `
                  <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.size}</td>
                    <td>${item.qty}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
            
            <div class="footer">
              If undelivered, return to: OURSFIT, 123 Streetwear Ave, Mumbai, MH 400001
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter((order: any) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      order._id.toLowerCase().includes(lowerQuery) ||
      (order.user?.name || "").toLowerCase().includes(lowerQuery) ||
      (order.user?.email || "").toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Orders</h1>
          <p className="text-sm opacity-70 uppercase tracking-widest">Manage customer orders</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => fetchOrders()}
            disabled={refreshing}
            className="p-2 border border-border hover:bg-muted transition-colors rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-transparent border border-border text-sm focus:outline-none focus:border-foreground" 
            />
          </div>
          <button className="btn-outline flex items-center space-x-2 py-2 px-4 text-sm hidden md:flex">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-background border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Order ID</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Date</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Customer</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Total</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Payment</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center opacity-50">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center opacity-50">No orders found.</td>
                </tr>
              ) : filteredOrders.map((order: any) => (
                <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-bold text-sm">#{order._id.substring(0, 8)}</td>
                  <td className="p-4 text-sm opacity-70">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-bold">{order.user?.name || "Unknown"}</td>
                  <td className="p-4 text-sm font-bold">₹ {order.totalPrice?.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full w-max
                        ${order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-600' : 
                          order.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-600' : 
                          'bg-yellow-500/20 text-yellow-600'}`}
                      >
                        {order.paymentStatus || 'Pending'}
                      </span>
                      {order.razorpayPaymentId && (
                        <span className="text-[10px] opacity-50 mt-1 uppercase tracking-widest truncate max-w-[100px]">
                          {order.razorpayPaymentId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status || 'pending'}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="bg-transparent border border-border text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out for delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right flex justify-end space-x-2 items-center">
                    {(order.status === 'shipped' || order.status === 'out for delivery') && (
                      <button 
                        onClick={() => handlePrintLabel(order)}
                        className="flex items-center px-3 py-1 bg-black hover:bg-gray-800 text-white transition-colors rounded text-xs font-bold uppercase tracking-widest"
                      >
                        Print Label
                      </button>
                    )}
                    <Link href={`/admin/orders/${order._id}`} className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:opacity-70 transition-opacity ml-4">
                      Details
                    </Link>
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
