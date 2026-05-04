"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Bell, Ticket, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useStore();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/notifications/unread-count`, config);
        setUnreadCount(data.count);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/notifications`, config);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (id: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, config);
      
      // Update local state
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart, badge: unreadCount },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Pincodes", href: "/admin/pincodes", icon: MapPin },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-muted/50 pt-4">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-extrabold uppercase tracking-tighter">OursFit Admin</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
                  isActive ? "bg-accent text-white" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{link.name}</span>
                {link.badge && link.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-2">
                    {link.badge}
                  </span>
                )}
              </Link>

            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button className="flex items-center w-full px-4 py-3 text-sm font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8">
          <div className="font-bold uppercase tracking-widest text-sm opacity-50">
            Admin Panel
          </div>
          <div className="flex items-center space-x-4 relative">
            <button onClick={toggleNotifications} className="relative p-2 hover:bg-muted rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-12 mt-2 w-80 bg-background border border-border shadow-lg z-50 rounded">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="font-bold uppercase tracking-widest text-sm">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-xs opacity-50 hover:opacity-100">Close</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm opacity-50 font-bold uppercase tracking-widest">No notifications</div>
                  ) : (
                    notifications.map((notif: any) => (
                      <div key={notif._id} className={`p-4 border-b border-border last:border-0 ${notif.read ? 'opacity-60' : 'bg-muted/30'}`}>
                        <p className="text-sm font-bold mb-1">{notif.message}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] opacity-70 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</span>
                          {!notif.read && (
                            <button onClick={() => markAsRead(notif._id)} className="text-[10px] text-accent font-bold uppercase tracking-widest hover:underline">
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
              A
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
