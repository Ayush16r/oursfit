"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, RefreshCw } from "lucide-react";
import axios from "axios";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { user } = useStore();

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

  const addProduct = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      // The backend creates a sample product, we just trigger it and refresh
      const { data } = await axios.post(`${API_URL}/products`, {}, config);
      setEditingProduct(data);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product", error);
      alert("Failed to create product. Make sure you are an admin.");
    }
  };

  const saveProduct = async (id: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      await axios.put(`${API_URL}/products/${id}`, editingProduct, config);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product", error);
      alert("Failed to update product.");
    }
  };

  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setUploadingImage(true);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axios.post(`${API_URL}/upload`, formData, config);
      
      // Update the editing product with the new image URL appended
      setEditingProduct({
        ...editingProduct,
        images: [...(editingProduct.images || []), `${API_URL.replace('/api', '')}${data}`]
      });
      setUploadingImage(false);
    } catch (error) {
      console.error(error);
      setUploadingImage(false);
      alert("Failed to upload image");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      await axios.delete(`${API_URL}/products/${id}`, config);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product", error);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Products</h1>
          <p className="text-sm opacity-70 uppercase tracking-widest">Manage your inventory</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={fetchProducts}
            disabled={refreshing}
            className="p-2 border border-border hover:bg-muted transition-colors rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={addProduct} className="btn-primary flex items-center space-x-2 py-2 text-sm">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-background border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Product</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Category</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Price</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Stock</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center opacity-50">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center opacity-50">No products found.</td>
                </tr>
              ) : products.map((product: any) => (
                <tr key={product._id} className="hover:bg-muted/30 transition-colors">
                  {editingProduct && editingProduct._id === product._id ? (
                    <>
                      <td className="p-4"><input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-transparent border-b border-border focus:outline-none" /></td>
                      <td className="p-4"><input type="text" value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-transparent border-b border-border focus:outline-none text-xs" /></td>
                      <td className="p-4"><input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-transparent border-b border-border focus:outline-none" /></td>
                      <td className="p-4"><input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full bg-transparent border-b border-border focus:outline-none" /></td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-2">
                           <div className="flex flex-col space-y-1 mt-2">
                             {(editingProduct.images || []).map((img: string, i: number) => (
                               <div key={i} className="flex items-center space-x-2">
                                 <input 
                                   type="text" 
                                   value={img} 
                                   onChange={(e) => {
                                     const newImages = [...editingProduct.images];
                                     newImages[i] = e.target.value;
                                     setEditingProduct({...editingProduct, images: newImages});
                                   }} 
                                   className="w-full bg-transparent border-b border-border focus:outline-none text-[10px]" 
                                   placeholder="Image URL"
                                 />
                                 <button type="button" className="text-red-500 text-xs" onClick={() => {
                                    const newImages = [...editingProduct.images];
                                    newImages.splice(i, 1);
                                    setEditingProduct({...editingProduct, images: newImages});
                                 }}>X</button>
                               </div>
                             ))}
                           </div>
                           <div className="relative mt-2">
                             <input type="file" id={`image-upload-${product._id}`} onChange={uploadFileHandler} className="hidden" />
                             <label htmlFor={`image-upload-${product._id}`} className="text-[10px] cursor-pointer bg-muted hover:bg-muted/80 px-2 py-1 rounded inline-block font-bold uppercase w-max">
                               {uploadingImage ? 'Uploading...' : 'Upload Image'}
                             </label>
                           </div>
                           <div className="mt-4 border-t border-border pt-2">
                             <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Details (Accordion items)</p>
                             {(editingProduct.details || []).map((detail: string, i: number) => (
                               <div key={i} className="flex items-center space-x-2 mb-1">
                                 <textarea
                                   value={detail} 
                                   onChange={(e) => {
                                     const newDetails = [...(editingProduct.details || [])];
                                     newDetails[i] = e.target.value;
                                     setEditingProduct({...editingProduct, details: newDetails});
                                   }} 
                                   className="w-full bg-transparent border-b border-border focus:outline-none text-[10px]" 
                                   placeholder="Detail point"
                                 />
                                 <button type="button" className="text-red-500 text-xs" onClick={() => {
                                    const newDetails = [...(editingProduct.details || [])];
                                    newDetails.splice(i, 1);
                                    setEditingProduct({...editingProduct, details: newDetails});
                                 }}>X</button>
                               </div>
                             ))}
                             <button type="button" className="text-[10px] cursor-pointer bg-muted hover:bg-muted/80 px-2 py-1 rounded inline-block font-bold uppercase w-max mt-1" onClick={() => {
                               setEditingProduct({...editingProduct, details: [...(editingProduct.details || []), ""]});
                             }}>Add Detail</button>
                           </div>
                        </div>
                      </td>
                      <td className="p-4 text-right flex justify-end space-x-2">
                        <button onClick={() => saveProduct(product._id)} className="p-2 bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors rounded text-xs font-bold uppercase">Save</button>
                        <button onClick={() => setEditingProduct(null)} className="p-2 bg-muted hover:bg-muted/80 transition-colors rounded text-xs font-bold uppercase">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 font-bold text-sm">{product.name}</td>
                      <td className="p-4 text-sm opacity-70 uppercase tracking-widest text-xs">{product.category}</td>
                      <td className="p-4 text-sm font-bold">₹{product.price}</td>
                      <td className="p-4 text-sm font-bold">{product.stock}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full
                          ${product.stock > 10 ? 'bg-green-500/20 text-green-600' : 
                            product.stock > 0 ? 'bg-yellow-500/20 text-yellow-600' : 
                            'bg-red-500/20 text-red-600'}`}
                        >
                          {product.stock > 10 ? 'Active' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end space-x-2">
                        <button 
                          onClick={() => setEditingProduct(product)}
                          className="p-2 hover:bg-muted transition-colors rounded tooltip" 
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product._id)}
                          className="p-2 hover:bg-red-500/10 text-red-500 transition-colors rounded tooltip" 
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
