"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { Save } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    deliveryDays: 5,
    freeShippingThreshold: 1000,
    codFee: 50,
    gstPercentage: 18,
    gstThreshold: 1000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useStore();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/settings`);
        if (data) {
          setSettings({
            deliveryDays: data.deliveryDays || 5,
            freeShippingThreshold: data.freeShippingThreshold || 1000,
            codFee: data.codFee !== undefined ? data.codFee : 50,
            gstPercentage: data.gstPercentage !== undefined ? data.gstPercentage : 18,
            gstThreshold: data.gstThreshold !== undefined ? data.gstThreshold : 1000,
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
      };
      await axios.put(`${API_URL}/settings`, settings, config);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center opacity-50 uppercase tracking-widest font-bold">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Store Settings</h1>
        <p className="text-sm opacity-70 uppercase tracking-widest">Manage global configuration for your store</p>
      </div>

      <div className="bg-background border border-border p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest block">Standard Delivery Days</label>
            <input 
              type="number" 
              name="deliveryDays"
              value={settings.deliveryDays}
              onChange={handleChange}
              className="w-full bg-transparent border border-border focus:border-foreground focus:outline-none px-4 py-2"
            />
            <p className="text-[10px] opacity-70">Used for estimated delivery dates.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest block">Free Shipping Threshold (₹)</label>
            <input 
              type="number" 
              name="freeShippingThreshold"
              value={settings.freeShippingThreshold}
              onChange={handleChange}
              className="w-full bg-transparent border border-border focus:border-foreground focus:outline-none px-4 py-2"
            />
            <p className="text-[10px] opacity-70">Orders above this amount get free shipping.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest block">Cash On Delivery (COD) Fee (₹)</label>
            <input 
              type="number" 
              name="codFee"
              value={settings.codFee}
              onChange={handleChange}
              className="w-full bg-transparent border border-border focus:border-foreground focus:outline-none px-4 py-2"
            />
            <p className="text-[10px] opacity-70">Extra fee applied when user selects COD.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest block">GST Percentage (%)</label>
            <input 
              type="number" 
              name="gstPercentage"
              value={settings.gstPercentage}
              onChange={handleChange}
              className="w-full bg-transparent border border-border focus:border-foreground focus:outline-none px-4 py-2"
            />
            <p className="text-[10px] opacity-70">Tax percentage applied to orders.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest block">GST Waiver Threshold (₹)</label>
            <input 
              type="number" 
              name="gstThreshold"
              value={settings.gstThreshold}
              onChange={handleChange}
              className="w-full bg-transparent border border-border focus:border-foreground focus:outline-none px-4 py-2"
            />
            <p className="text-[10px] opacity-70">Orders at or above this value will have 0 GST.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2 px-6 py-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
