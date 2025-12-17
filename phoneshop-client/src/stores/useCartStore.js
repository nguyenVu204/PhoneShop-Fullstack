import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, variant) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          item => item.id === product.id && item.variantId === variant.id
        );

        if (existingItem) {
          const updatedItems = currentItems.map(item =>
            item.id === product.id && item.variantId === variant.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ items: updatedItems });
        } else {
          const newItem = {
            id: product.id,
            name: product.name,
            brandName: product.brandName,
            variantId: variant.id,
            color: variant.color,
            rom: variant.rom,
            price: variant.price,
            image: variant.imageUrl || variant.image || '', 
            quantity: 1,
          };
          set({ items: [...currentItems, newItem] });
        }
      },

      removeFromCart: (variantId) => {
        set({ items: get().items.filter(item => item.variantId !== variantId) });
      },

      clearCart: () => set({ items: [] }),

      
      updateQuantity: (variantId, quantity) => {
        const currentItems = get().items;
        if (quantity < 1) return; // Không cho giảm dưới 1

        const updatedItems = currentItems.map(item => 
            item.variantId === variantId ? { ...item, quantity } : item
        );
        set({ items: updatedItems });
      },
    }),
    {
      name: 'phone-shop-cart',
    }
  )
);

export default useCartStore;