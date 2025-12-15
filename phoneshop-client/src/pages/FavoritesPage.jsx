import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import useFavoriteStore from '../stores/useFavoriteStore';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite } = useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
        const res = await axiosClient.get('/favorites/list');
        setProducts(res.data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleRemove = async (id) => {
      await toggleFavorite(id); // Gọi store để update state global
      setProducts(products.filter(p => p.id !== id)); // Xóa khỏi danh sách hiện tại
  };

  if (loading) return <div className="py-20 text-center">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-10 min-h-[80vh]">
      <h1 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <Heart className="text-red-500 fill-red-500"/> Sản phẩm yêu thích
      </h1>

      {products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
              <p className="text-gray-500 mb-4">Danh sách yêu thích đang trống.</p>
              <Link to="/" className="text-blue-600 font-bold hover:underline">Tiếp tục mua sắm</Link>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map(product => (
                 <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition group">
                    <Link to={`/product/${product.id}`} className="flex-1">
                        <div className="h-40 mb-4 flex items-center justify-center">
                            <img src={product.thumbnail} alt={product.name} className="h-full object-contain group-hover:scale-105 transition"/>
                        </div>
                        <p className="text-xs text-blue-500 font-bold uppercase mb-1">{product.brandName}</p>
                        <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">{product.name}</h3>
                        <p className="text-red-600 font-bold text-lg">{product.minPrice.toLocaleString('vi-VN')} ₫</p>
                    </Link>
                    
                    <button 
                        onClick={() => handleRemove(product.id)}
                        className="mt-4 w-full py-2 flex items-center justify-center gap-2 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition text-sm font-bold"
                    >
                        <Trash2 size={16}/> Bỏ thích
                    </button>
                 </div>
            ))}
        </div>
      )}
    </div>
  );
}