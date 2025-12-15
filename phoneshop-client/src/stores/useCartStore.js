import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // Danh sách sản phẩm trong giỏ

      // Hành động: Thêm vào giỏ
      addToCart: (product, variant) => {
        const currentItems = get().items;
        // Kiểm tra xem sản phẩm + biến thể này đã có trong giỏ chưa
        const existingItem = currentItems.find(
          item => item.id === product.id && item.variantId === variant.id
        );

        if (existingItem) {
          // Nếu có rồi -> Tăng số lượng lên 1
          const updatedItems = currentItems.map(item =>
            item.id === product.id && item.variantId === variant.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ items: updatedItems });
        } else {
          // Nếu chưa có -> Thêm mới vào
          const newItem = {
            id: product.id,
            name: product.name,
            brandName: product.brandName,
            // Lưu thông tin biến thể để hiển thị
            variantId: variant.id,
            color: variant.color,
            rom: variant.rom,
            price: variant.price,
            image: variant.image || '', // Sau này có ảnh thì thêm vào
            quantity: 1,
          };
          set({ items: [...currentItems, newItem] });
        }
      },

      // Hành động: Xóa khỏi giỏ
      removeFromCart: (variantId) => {
        set({ items: get().items.filter(item => item.variantId !== variantId) });
      },

      // Hành động: Xóa hết (khi đặt hàng xong)
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'phone-shop-cart', // Tên key lưu trong LocalStorage
    }
  )
);

export default useCartStore;