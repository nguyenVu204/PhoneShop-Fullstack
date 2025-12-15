import { create } from 'zustand';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const useFavoriteStore = create((set, get) => ({
  favoriteIds: [], // Chỉ lưu mảng ID: [1, 5, 8] để check nhanh

  // Load danh sách ID khi user đăng nhập
  fetchFavorites: async () => {
    try {
      const res = await axiosClient.get('/favorites/ids');
      set({ favoriteIds: res.data });
    } catch (error) {
      console.log("Lỗi tải favorites (có thể do chưa login)");
      set({ favoriteIds: [] });
    }
  },

  // Hàm xử lý Like/Unlike
  toggleFavorite: async (productId) => {
    try {
      // Gọi API
      const res = await axiosClient.post(`/favorites/toggle/${productId}`);
      
      // Cập nhật State Frontend ngay lập tức
      const { favoriteIds } = get();
      const isLiked = res.data.isLiked;

      if (isLiked) {
        set({ favoriteIds: [...favoriteIds, productId] });
        toast.success("Đã thêm vào yêu thích ❤️");
      } else {
        set({ favoriteIds: favoriteIds.filter(id => id !== productId) });
        toast.success("Đã bỏ yêu thích 💔");
      }
    } catch (error) {
      // Nếu lỗi 401 (chưa login)
      if (error.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để yêu thích sản phẩm!");
      } else {
        toast.error("Lỗi kết nối!");
      }
    }
  }
}));

export default useFavoriteStore;