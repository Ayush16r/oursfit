"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, RefreshCw, CheckCircle } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

import { getImageUrl } from "@/utils/getImageUrl";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
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

  const updateOrderStatus = async (id: string, currentStatus: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      
      let endpoint = '';
      if (currentStatus === 'pending') {
        // Technically we need backend routes for processing and shipped.
        // For now, let's just use deliver endpoint and we will modify backend to handle generic status update.
        // Actually, backend has only /deliver which sets isDelivered=true and status='delivered'.
        // Let's call /deliver for now or we need to add a generic update status route.
      }

      await axios.put(`${API_URL}/orders/${id}/deliver`, {}, config);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order", error);
      alert("Failed to update order status.");
    }
  };

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
            <input type="text" placeholder="Search orders..." className="pl-10 pr-4 py-2 bg-transparent border border-border text-sm focus:outline-none focus:border-foreground" />
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
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center opacity-50">No orders found.</td>
                </tr>
              ) : orders.map((order: any) => (
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
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full w-max
                      ${order.status === 'delivered' ? 'bg-green-500/20 text-green-600' : 
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' : 
                        'bg-blue-500/20 text-blue-600'}`}
                    >
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end space-x-2 items-center">
                    {order.status !== 'delivered' && (
                      <button 
                        onClick={() => updateOrderStatus(order._id, order.status)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white transition-colors rounded text-xs font-bold uppercase tracking-widest"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Confirm Delivery</span>
                      </button>
                    )}
                    <button onClick={() => setSelectedOrder(order)} className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:opacity-70 transition-opacity ml-4">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-lg font-bold uppercase tracking-widest text-foreground">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-red-500 font-bold hover:opacity-70 transition-opacity">
                CLOSE
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Order ID</p>
                  <p className="font-mono">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Date Placed</p>
                  <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Payment Status</p>
                  <p className="uppercase font-bold text-teal-600">{selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-bold">₹ {selectedOrder.totalPrice?.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 border-b border-border pb-2">Shipping Address</h3>
                <div className="text-sm">
                  <p className="font-bold">{selectedOrder.user?.name}</p>
                  <p>{selectedOrder.shippingAddress?.street}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                  <p>{selectedOrder.shippingAddress?.country} - {selectedOrder.shippingAddress?.postalCode}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 border-b border-border pb-2">Items Ordered ({selectedOrder.orderItems?.length})</h3>
                <div className="space-y-4">
                  {selectedOrder.orderItems?.map((item: any, i: number) => (
                    <div key={i} className="flex space-x-4">
                      <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        {/* Use img to bypass strict Next.js external Image configs */}
                        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex justify-between">
                        <div>
                          <p className="font-bold text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Size: {item.size}</p>
                          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Qty: {item.qty}</p>
                        </div>
                        <p className="font-bold text-sm">₹ {(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
