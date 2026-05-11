import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backends.onrender.com/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  isMember?: boolean;
  wishlist?: string[];
  addresses?: any[];
  cart?: any[];
  tssPoints?: number;
  tssMoney?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface StoreState {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  addresses: any[];
  appliedCoupon: { code: string; discountPercentage: number } | null;
  setUser: (user: User | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  setWishlist: (wishlist: string[]) => void;
  setAddresses: (addresses: any[]) => void;
  setAppliedCoupon: (coupon: { code: string; discountPercentage: number } | null) => void;
  toggleWishlist: (productId: string) => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      cart: [],
      wishlist: [],
      addresses: [],
      appliedCoupon: null,
      setUser: (user) => {
        set({ 
          user, 
          wishlist: user?.wishlist || [],
          addresses: user?.addresses || [] 
        });
        if (user && user.cart) {
          // Simplistic merge: prefer DB cart, but in a real app you might merge local and DB
          // Map DB cart format to local CartItem format
          const formattedCart = user.cart.map((item: any) => ({
             id: item.product._id || item.product, // Depending on if it's populated
             name: item.product.name || "Product", // Will need real population in backend or fetch
             price: item.product.price || 0,
             image: item.product.images ? item.product.images[0] : "",
             size: item.size,
             quantity: item.quantity
          }));
          // For now, we just rely on what's fetched
          // Note: the backend getCart populates product, but login returns unpopulated. 
          // We will fetch the populated cart after login.
        }
      },
      addToCart: async (item) => {
        set((state) => {
          const existingItem = state.cart.find(
            (i) => i.id === item.id && i.size === item.size
          );
          let newCart;
          if (existingItem) {
            newCart = state.cart.map((i) =>
              i.id === item.id && i.size === item.size
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
             newCart = [...state.cart, item];
          }
          
          // Sync with DB
          const user = get().user;
          if (user && user.token) {
            const dbCart = newCart.map(c => ({ product: c.id, quantity: c.quantity, size: c.size }));
            axios.post(`${API_URL}/cart/sync`, { cart: dbCart }, {
              headers: { Authorization: `Bearer ${user.token}` }
            }).catch(console.error);
          }

          return { cart: newCart };
        });
      },
      removeFromCart: (id, size) => {
        set((state) => {
          const newCart = state.cart.filter((i) => !(i.id === id && i.size === size));
          const user = get().user;
          if (user && user.token) {
            const dbCart = newCart.map(c => ({ product: c.id, quantity: c.quantity, size: c.size }));
            axios.post(`${API_URL}/cart/sync`, { cart: dbCart }, {
              headers: { Authorization: `Bearer ${user.token}` }
            }).catch(console.error);
          }
          return { cart: newCart };
        });
      },
      updateQuantity: (id, size, quantity) => {
        set((state) => {
          const newCart = state.cart.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i
          );
          const user = get().user;
          if (user && user.token) {
            const dbCart = newCart.map(c => ({ product: c.id, quantity: c.quantity, size: c.size }));
            axios.post(`${API_URL}/cart/sync`, { cart: dbCart }, {
              headers: { Authorization: `Bearer ${user.token}` }
            }).catch(console.error);
          }
          return { cart: newCart };
        });
      },
      clearCart: () => {
         set({ cart: [] });
         const user = get().user;
         if (user && user.token) {
           axios.post(`${API_URL}/cart/sync`, { cart: [] }, {
             headers: { Authorization: `Bearer ${user.token}` }
           }).catch(console.error);
         }
      },
      setWishlist: (wishlist) => set({ wishlist }),
      toggleWishlist: async (productId) => {
        const user = get().user;
        const currentWishlist = get().wishlist;
        const isWished = currentWishlist.includes(productId);
        
        // Optimistic UI update
        const newWishlist = isWished 
          ? currentWishlist.filter(id => id !== productId)
          : [...currentWishlist, productId];
        
        set({ wishlist: newWishlist });

        if (user && user.token) {
          try {
            await axios.post(`${API_URL}/auth/wishlist`, { productId }, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
          } catch (error) {
            console.error("Failed to sync wishlist", error);
            // Revert optimistic update
            set({ wishlist: currentWishlist });
          }
        }
      },
      setAddresses: (addresses) => set({ addresses }),
      setAppliedCoupon: (appliedCoupon) => set({ appliedCoupon }),
    }),
    {
      name: 'oursfit-storage',
    }
  )
);
