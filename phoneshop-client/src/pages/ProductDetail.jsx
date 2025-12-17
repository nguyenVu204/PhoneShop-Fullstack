import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Check } from "lucide-react";
import toast from 'react-hot-toast';
import axiosClient from "../api/axiosClient";
import useCartStore from "../stores/useCartStore";
import ReviewSection from '../components/ReviewSection';

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const addToCart = useCartStore((state) => state.addToCart);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addToCart(product, selectedVariant);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant);
    navigate("/cart");
  };

  useEffect(() => {
    axiosClient
      .get(`/products/${id}`)
      .then((res) => {
        const data = res.data;
        setProduct(data);

        // Mặc định chọn luôn biến thể đầu tiên
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!product)
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy sản phẩm!
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* CỘT TRÁI: ẢNH */}
          <div className="space-y-4">
             <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                <img 
                   src={selectedVariant?.imageUrl || product.thumbnail} 
                   alt={product.name} 
                   className="w-3/4 object-contain hover:scale-105 transition duration-500"
                />
             </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div>
             <span className="text-blue-600 font-bold tracking-wide text-sm bg-blue-50 px-3 py-1 rounded-full uppercase">
                {product.brandName}
             </span>
             <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-4 mb-2">{product.name}</h1>
             
             {/* Giá */}
             <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-red-600">
                   {selectedVariant?.price.toLocaleString('vi-VN')} ₫
                </span>
                {selectedVariant && (
                   <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded font-medium flex items-center gap-1">
                      Kho: {selectedVariant.stockQuantity}
                   </span>
                )}
             </div>

             <div className="h-px bg-gray-100 my-6"></div>

             {/* Chọn Biến thể - Style mới */}
             <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-500 mb-2">Chọn phiên bản:</label>
                   <div className="flex flex-wrap gap-3">
                      {product.variants.map(v => {
                         const isSelected = selectedVariant?.id === v.id;
                         return (
                            <button
                               key={v.id}
                               onClick={() => setSelectedVariant(v)}
                               className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                                  isSelected 
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
                               }`}
                            >
                               {v.color} - {v.rom} - {v.ram}
                            </button>
                         )
                      })}
                   </div>
                </div>

                {/* Số lượng */}
                <div className="flex items-center gap-4">
                   <div className="flex items-center border-2 border-gray-200 rounded-xl">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold">-</button>
                      <span className="px-4 font-bold text-slate-800">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold">+</button>
                   </div>
                   
                   <button 
                      onClick={handleAddToCart}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                   >
                      <ShoppingCart size={20}/>
                      Thêm vào giỏ
                   </button>
                </div>
             </div>

             {/* Mô tả */}
             <div className="mt-8 bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-gray-700 mb-2">Mô tả sản phẩm</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                   {product.description || "Đang cập nhật..."}
                </p>
             </div>
          </div>
       </div>
       <ReviewSection productId={id} />
    </div>
);
}
