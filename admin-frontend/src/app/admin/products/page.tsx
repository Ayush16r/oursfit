"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Edit2, Trash2, RefreshCw, UploadCloud, X, Search, Filter, Image as ImageIcon, Package } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data } = await axios.get(`${API_URL}/products`);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching admin products", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct({ ...product });
    } else {
      setEditingProduct({
        name: "",
        description: "",
        price: 0,
        originalPrice: 0,
        images: [],
        category: "T-Shirts",
        status: "draft",
        variants: [],
        tags: [],
        details: [],
        fabric: "",
        seoTitle: "",
        seoDescription: "",
        isFeatured: false,
        isTrending: false,
        isNewArrival: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      
      if (editingProduct._id) {
        // Update
        await axios.put(`${API_URL}/products/${editingProduct._id}`, editingProduct, config);
      } else {
        // Since backend create is dummy, we can't create fully populated unless we override backend logic. 
        // Oh wait, our new backend createProduct uses dummy data. Let's send the full payload to a POST. 
        // Wait, the backend createProduct ignores req.body. 
        // We should hit POST, get the dummy, then immediately PUT with the real data.
        const { data: dummy } = await axios.post(`${API_URL}/products`, {}, config);
        await axios.put(`${API_URL}/products/${dummy._id}`, editingProduct, config);
      }
      
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product", error);
      alert("Failed to save product.");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`${API_URL}/products/${id}`, config);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product", error);
      alert("Failed to delete product.");
    }
  };

  // Drag and Drop Logic
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    setUploadingImage(true);
    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const formData = new FormData();
      
      // Upload images one by one or multiple if backend supports. 
      // We added /upload/multiple to backend. Let's use it.
      files.forEach(f => formData.append("images", f));
      
      const { data } = await axios.post(`${API_URL}/upload/multiple`, formData, config);
      
      const newImageUrls = data.map((url: string) => url.startsWith('http') ? url : `${API_URL.replace('/api', '')}${url}`);
      
      // Remove placeholder if it's the only one
      const currentImages = editingProduct.images || [];
      const cleanImages = (currentImages.length === 1 && currentImages[0].includes('sample.jpg')) ? [] : currentImages;

      setEditingProduct({
        ...editingProduct,
        images: [...cleanImages, ...newImageUrls]
      });
    } catch (error) {
      console.error(error);
      alert("Failed to upload images");
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tighter mb-1">Products</h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Manage your inventory & variants</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchProducts}
            disabled={refreshing}
            className="p-3 glass rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5 text-foreground/70", refreshing && "animate-spin")} />
          </button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
          <button className="flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-2 border border-border/50 rounded-lg bg-background">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/30">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Inventory</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Price</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest">No products found</p>
                  </td>
                </tr>
              ) : filteredProducts.map((product: any) => (
                <tr key={product._id} className="hover:bg-muted/20 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm line-clamp-1">{product.name}</p>
                        {product.variants?.length > 0 && (
                          <p className="text-xs text-muted-foreground">{product.variants.length} Variants</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                      product.status === 'published' ? "bg-green-500/10 text-green-500 border border-green-500/20" : 
                      product.status === 'draft' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                      "bg-muted text-muted-foreground border border-border"
                    )}>
                      {product.status || 'Published'}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium">
                    <span className={product.stock > 10 ? "text-foreground" : product.stock > 0 ? "text-yellow-500" : "text-destructive"}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="p-4 text-sm uppercase tracking-widest opacity-70 text-xs font-bold">{product.category}</td>
                  <td className="p-4 text-sm font-bold">₹{product.price}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 hover:bg-accent hover:text-accent-foreground text-foreground/70 transition-colors rounded-lg" 
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product._id)}
                        className="p-2 hover:bg-destructive hover:text-destructive-foreground text-foreground/70 transition-colors rounded-lg" 
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Modal for Add/Edit Product */}
      <AnimatePresence>
        {isModalOpen && editingProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-extrabold uppercase tracking-tighter">
                  {editingProduct._id ? "Edit Product" : "New Product"}
                </h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="product-form" onSubmit={saveProduct} className="space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-accent">Basic Info</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Name</label>
                        <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Description</label>
                        <textarea required value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none min-h-[100px]" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Price (₹)</label>
                          <input required type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Original Price (₹)</label>
                          <input type="number" value={editingProduct.originalPrice || ''} onChange={e => setEditingProduct({...editingProduct, originalPrice: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="For strikethrough" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-accent">Media</h3>
                    
                    {/* Image Grid */}
                    {editingProduct.images && editingProduct.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-4">
                        {editingProduct.images.map((img: string, i: number) => (
                          <div key={i} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-muted">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => {
                                const newImages = [...editingProduct.images];
                                newImages.splice(i, 1);
                                setEditingProduct({...editingProduct, images: newImages});
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {i === 0 && <span className="absolute bottom-1 left-1 text-[8px] bg-accent text-white px-1 py-0.5 rounded uppercase font-bold">Main</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Drag & Drop Zone */}
                    <div 
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-accent/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-muted/20"
                    >
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect}
                        accept="image/*" 
                      />
                      <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-bold">Drag & drop images here</p>
                      <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
                      {uploadingImage && <p className="text-xs text-accent mt-2 animate-pulse font-bold">Uploading...</p>}
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-accent">Variants & Inventory</h3>
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingProduct({
                            ...editingProduct, 
                            variants: [...(editingProduct.variants || []), { color: '', size: '', stock: 0, sku: '' }]
                          });
                        }}
                        className="text-xs bg-muted hover:bg-muted-foreground/20 px-3 py-1.5 rounded-lg font-bold uppercase transition-colors"
                      >
                        Add Variant
                      </button>
                    </div>
                    
                    {(!editingProduct.variants || editingProduct.variants.length === 0) ? (
                      <div className="p-4 border border-border rounded-lg bg-muted/20">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Total Stock (No variants)</label>
                        <input type="number" value={editingProduct.stock || 0} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg p-3 text-sm outline-none" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editingProduct.variants.map((v: any, i: number) => (
                          <div key={i} className="flex gap-2 items-center p-3 border border-border rounded-lg bg-muted/10">
                            <input placeholder="Color (e.g. Black)" value={v.color} onChange={e => {
                              const newVars = [...editingProduct.variants]; newVars[i].color = e.target.value; setEditingProduct({...editingProduct, variants: newVars});
                            }} className="flex-1 bg-background border border-border rounded p-2 text-xs outline-none" />
                            <input placeholder="Size (e.g. M)" value={v.size} onChange={e => {
                              const newVars = [...editingProduct.variants]; newVars[i].size = e.target.value; setEditingProduct({...editingProduct, variants: newVars});
                            }} className="w-16 bg-background border border-border rounded p-2 text-xs outline-none" />
                            <input type="number" placeholder="Stock" value={v.stock} onChange={e => {
                              const newVars = [...editingProduct.variants]; newVars[i].stock = Number(e.target.value); setEditingProduct({...editingProduct, variants: newVars});
                            }} className="w-20 bg-background border border-border rounded p-2 text-xs outline-none" />
                            <input placeholder="SKU" value={v.sku || ''} onChange={e => {
                              const newVars = [...editingProduct.variants]; newVars[i].sku = e.target.value; setEditingProduct({...editingProduct, variants: newVars});
                            }} className="flex-1 bg-background border border-border rounded p-2 text-xs outline-none" />
                            <button type="button" onClick={() => {
                              const newVars = [...editingProduct.variants]; newVars.splice(i, 1); setEditingProduct({...editingProduct, variants: newVars});
                            }} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Organization & Meta */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-accent">Organization</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Category</label>
                        <input type="text" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-background border border-border rounded-lg p-3 text-sm outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Status</label>
                        <select value={editingProduct.status} onChange={e => setEditingProduct({...editingProduct, status: e.target.value})} className="w-full bg-background border border-border rounded-lg p-3 text-sm outline-none">
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4 border-t border-border pt-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-accent">Storefront Toggles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-muted/30">
                        <input type="checkbox" checked={editingProduct.isFeatured} onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked})} className="accent-accent" />
                        <span className="text-sm font-bold uppercase">Featured</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-muted/30">
                        <input type="checkbox" checked={editingProduct.isTrending} onChange={e => setEditingProduct({...editingProduct, isTrending: e.target.checked})} className="accent-accent" />
                        <span className="text-sm font-bold uppercase">Trending</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-muted/30">
                        <input type="checkbox" checked={editingProduct.isNewArrival} onChange={e => setEditingProduct({...editingProduct, isNewArrival: e.target.checked})} className="accent-accent" />
                        <span className="text-sm font-bold uppercase">New Arrival</span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-border bg-muted/10 flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="btn-outline">Cancel</button>
                <button type="submit" form="product-form" className="btn-primary">Save Product</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
