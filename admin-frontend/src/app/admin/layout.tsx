"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Bell, Ticket, MapPin, Percent, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useStore();

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
      
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart, badge: unreadCount },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Marketing", href: "/admin/marketing", icon: Percent },
    { name: "Pincodes", href: "/admin/pincodes", icon: MapPin },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-border/50 flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            OursFit
            <span className="text-accent ml-1">.</span>
          </h2>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-6 h-6 text-foreground/70" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-accent/10 border border-accent/20 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "relative flex items-center px-4 py-3 text-sm font-bold uppercase tracking-widest rounded-lg transition-colors z-10",
                  isActive ? "text-accent" : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                )}>
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="flex-1">{link.name}</span>
                  {link.badge && link.badge > 0 && (
                    <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full ml-2">
                      {link.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border/50">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 glass border-b border-border/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              className="mr-4 p-2 rounded-md hover:bg-muted md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-bold uppercase tracking-widest text-sm opacity-50 hidden sm:block">
              Admin Portal / <span className="text-foreground opacity-100">{pathname.split('/').pop() || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 relative">
            <button onClick={toggleNotifications} className="relative p-2 hover:bg-muted rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background animate-pulse"></span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-12 mt-2 w-80 glass-panel shadow-2xl z-50 overflow-hidden origin-top-right"
                >
                  <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/30">
                    <h3 className="font-bold uppercase tracking-widest text-sm">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-xs opacity-50 hover:opacity-100 transition-opacity">Close</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm opacity-50 font-bold uppercase tracking-widest flex flex-col items-center">
                        <Bell className="w-8 h-8 mb-2 opacity-20" />
                        All caught up
                      </div>
                    ) : (
                      notifications.map((notif: any) => (
                        <div key={notif._id} className={cn("p-4 border-b border-border/50 last:border-0 transition-colors", notif.read ? 'opacity-60' : 'bg-accent/5')}>
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
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/70 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-background">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content with Transition */}
        <div className="p-4 md:p-8 flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
