import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // Thông tin user (tên, email...)
      token: null, // Chuỗi JWT dùng để gọi API sau này
      
      // Hành động: Đăng nhập (Lưu thông tin)
      login: (userData, token) => set({ user: userData, token: token }),
      
      // Hành động: Đăng xuất (Xóa sạch)
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'phone-shop-auth', // Tên key lưu trong LocalStorage
    }
  )
);

export default useAuthStore;