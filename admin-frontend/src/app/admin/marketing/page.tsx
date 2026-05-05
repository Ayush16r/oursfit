"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { Settings, Percent, Save, Truck, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backends.onrender.com/api';

export default function MarketingSettings() {
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [deliveryDays, setDeliveryDays] = useState(5);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [saleCategory, setSaleCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchSettingsAndCategories = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/settings`),
          axios.get(`${API_URL}/products`)
        ]);
        
        if (settingsRes.data && settingsRes.data.deliveryDays) {
          setDeliveryDays(settingsRes.data.deliveryDays);
        }
        
        if (productsRes.data && Array.isArray(productsRes.data)) {
           const uniqueCategories = Array.from(new Set(productsRes.data.map((p: any) => p.category)));
           setCategories(uniqueCategories as string[]);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsAndCategories();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`${API_URL}/settings`, { deliveryDays }, config);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyGlobalSale = async () => {
    const targetMsg = saleCategory === "All" ? "ALL products" : `all products in category '${saleCategory}'`;
    if (!confirm(`Are you sure you want to apply a ${discountPercent}% discount to ${targetMsg}? (Setting to 0 resets the sale)`)) {
      return;
    }
    
    try {
      setSaving(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.post(`${API_URL}/products/sale`, { 
        discountPercentage: Number(discountPercent),
        category: saleCategory
      }, config);
      alert(data.message);
    } catch (error) {
      console.error(error);
      alert("Failed to apply global sale.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center opacity-50 uppercase tracking-widest font-bold">Loading Settings...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Marketing & Delivery</h1>
        <p className="text-sm opacity-70 uppercase tracking-widest">Global settings for your store</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Delivery Settings */}
        <div className="bg-background border border-border p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6 border-b border-border pb-4">
            <Truck className="w-6 h-6 text-foreground" />
            <h2 className="text-xl font-bold uppercase tracking-widest">Logistics</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Expected Delivery Days</label>
              <input 
                type="number" 
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="w-full bg-transparent border border-border p-3 rounded focus:outline-none focus:border-foreground"
              />
              <p className="text-[10px] opacity-50 mt-2 uppercase tracking-widest leading-relaxed">
                This dictates the "Expected Delivery" date shown to customers on their order tracking page.
              </p>
            </div>
            
            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="mt-4 flex items-center space-x-2 bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-widest rounded hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              <span>Save Delivery Settings</span>
            </button>
          </div>
        </div>

        {/* Global Sale */}
        <div className="bg-background border border-border p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6 border-b border-border pb-4">
            <Percent className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold uppercase tracking-widest">Global Flash Sale</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded flex items-start space-x-3 text-red-600 mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs uppercase tracking-widest leading-relaxed font-bold">
                Warning: This instantly recalculates the price of ALL products in your database. 
                Original prices are saved so you can revert by setting the discount back to 0%.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Target Category</label>
                <select 
                  value={saleCategory}
                  onChange={(e) => setSaleCategory(e.target.value)}
                  className="w-full bg-transparent border border-border p-3 rounded focus:outline-none focus:border-foreground"
                >
                  <option value="All">All Products (Overall)</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Sale Percentage (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full bg-transparent border border-border p-3 rounded focus:outline-none focus:border-red-500 text-red-500 font-bold"
                />
              </div>
            </div>
            
            <button 
              onClick={handleApplyGlobalSale}
              disabled={saving}
              className="mt-4 flex items-center space-x-2 bg-red-500 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest rounded hover:bg-red-600 transition-colors"
            >
              <Percent className="w-4 h-4" />
              <span>Apply Global Sale</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
