"use client";

import { useState, useEffect } from "react";
import { Percent, Megaphone, Zap, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminMarketingPage() {
  const { user } = useStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/settings`);
        setSettings(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModal === 'announcement') {
      try {
        setSaving(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.put(`${API_URL}/settings`, {
          announcementText: settings.announcementText,
          announcementActive: settings.announcementActive
        }, config);
        alert("Announcement banner updated successfully!");
        setActiveModal(null);
      } catch (error) {
        alert("Failed to save settings");
      } finally {
        setSaving(false);
      }
    } else {
      alert("Saved successfully! (Backend integration pending for this module)");
      setActiveModal(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Marketing</h1>
        <p className="text-sm opacity-70 uppercase tracking-widest">Run campaigns, flash sales, and announcements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Flash Sales Card */}
        <div 
          onClick={() => setActiveModal("flash")}
          className="glass-panel p-6 rounded-xl border border-border/50 relative overflow-hidden group hover:border-accent/50 transition-colors cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors"></div>
          <Zap className="w-8 h-8 text-accent mb-4 relative z-10" />
          <h2 className="text-xl font-bold uppercase tracking-tighter mb-2 relative z-10">Flash Sales</h2>
          <p className="text-sm text-muted-foreground mb-4 relative z-10">
            Create limited-time drops with countdown timers to generate hype.
          </p>
          <button className="btn-outline w-full relative z-10 text-xs font-bold pointer-events-none">Configure Drop</button>
        </div>

        {/* Announcement Bar */}
        <div 
          onClick={() => setActiveModal("announcement")}
          className="glass-panel p-6 rounded-xl border border-border/50 relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
          <Megaphone className="w-8 h-8 text-blue-500 mb-4 relative z-10" />
          <h2 className="text-xl font-bold uppercase tracking-tighter mb-2 relative z-10">Announcements</h2>
          <p className="text-sm text-muted-foreground mb-4 relative z-10">
            Update the top scrolling marquee banner on the storefront.
          </p>
          <button className="btn-outline w-full relative z-10 text-xs font-bold pointer-events-none">Edit Banner</button>
        </div>

        {/* Featured Collections */}
        <div 
          onClick={() => setActiveModal("campaigns")}
          className="glass-panel p-6 rounded-xl border border-border/50 relative overflow-hidden group hover:border-purple-500/50 transition-colors cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
          <Percent className="w-8 h-8 text-purple-500 mb-4 relative z-10" />
          <h2 className="text-xl font-bold uppercase tracking-tighter mb-2 relative z-10">Campaigns</h2>
          <p className="text-sm text-muted-foreground mb-4 relative z-10">
            Group products into featured collections for seasonal sales.
          </p>
          <button className="btn-outline w-full relative z-10 text-xs font-bold pointer-events-none">Manage Campaigns</button>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && (
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
                <h2 className="text-lg font-bold uppercase tracking-widest">
                  {activeModal === 'flash' ? "Configure Flash Sale" : 
                   activeModal === 'announcement' ? "Store Announcement" : "Campaign Manager"}
                </h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {activeModal === 'announcement' && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Banner Text</label>
                    <textarea 
                      required 
                      value={settings.announcementText || "USE CODE 'WELCOME10' FOR 10% OFF YOUR FIRST ORDER"}
                      onChange={e => setSettings({...settings, announcementText: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none min-h-[100px]"
                    />
                    <label className="flex items-center space-x-2 cursor-pointer mt-4 p-3 border border-border rounded-lg hover:bg-muted/30">
                      <input type="checkbox" checked={settings.announcementActive ?? true} onChange={e => setSettings({...settings, announcementActive: e.target.checked})} className="accent-accent" />
                      <span className="text-sm font-bold uppercase">Show Banner on Storefront</span>
                    </label>
                  </div>
                )}

                {activeModal === 'flash' && (
                  <>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Flash Sale Name</label>
                      <input type="text" defaultValue="Midnight Drop" className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">End Date & Time</label>
                      <input type="datetime-local" className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                  </>
                )}

                {activeModal === 'campaigns' && (
                  <div>
                    <p className="text-sm opacity-70 mb-4">You can feature specific products on the homepage by updating their "Featured" toggle in the Products menu.</p>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Campaign Title</label>
                    <input type="text" defaultValue="Summer Essentials" className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
                  </div>
                )}

                <button disabled={saving} type="submit" className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6">
                  {saving ? "Saving..." : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
