import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, Heart, ArrowRight, Truck, ShieldCheck, 
  Headphones, RefreshCw, Zap, Star, ChevronRight,
  Store, Info, Phone, LayoutGrid
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import useFavoriteStore from '../stores/useFavoriteStore';

export default function HomePage() {
  const navigate = useNavigate();
  const [newProducts, setNewProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { favoriteIds, toggleFavorite } = useFavoriteStore();

  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            const brandsRes = await axiosClient.get('/brands');
            setBrands(brandsRes.data);

            const newRes = await axiosClient.get('/products?page=1&limit=8&sort=newest');
            setNewProducts(newRes.data.items);

            const hotRes = await axiosClient.get('/products?page=1&limit=4&sort=price_asc');
            setHotProducts(hotRes.data.items);

            setLoading(false);
        } catch (error) {
            console.error("Lỗi tải trang chủ", error);
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // Card Sản phẩm
  const ProductCard = ({ product, label, labelColor }) => (
    <Link to={`/product/${product.id}`} className="group h-full block">
        <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col hover:-translate-y-1 relative overflow-hidden">
            {/* Nút Tim */}
            <button 
                onClick={(e) => { e.preventDefault(); toggleFavorite(product.id); }}
                className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition"
            >
                <Heart size={18} className={`transition-colors duration-300 ${favoriteIds.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
            </button>

            {/* Ảnh */}
            <div className="relative h-48 mb-4 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} className="h-36 object-contain group-hover:scale-110 transition duration-500 mix-blend-multiply"/>
                ) : <span className="text-gray-400 text-xs">No image</span>}
                
                {label && (
                    <span className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10 ${labelColor}`}>
                        {label}
                    </span>
                )}
            </div>

            {/* Thông tin */}
            <div className="flex-1 flex flex-col">
                <p className="text-xs text-blue-500 font-bold uppercase mb-1">{product.brandName}</p>
                <h3 className="font-bold text-gray-800 text-sm md:text-base mb-1 leading-snug group-hover:text-blue-600 transition line-clamp-2">{product.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="fill-yellow-400 text-yellow-400"/>
                    <span className="text-xs text-gray-500">4.9 (120)</span>
                </div>
            </div>

            {/* Giá */}
            <div className="mt-2 flex items-end justify-between">
                <div>
                    <div className="text-red-600 font-bold text-lg">{product.minPrice.toLocaleString("vi-VN")} ₫</div>
                    <span className="text-xs text-gray-400 line-through">Giá niêm yết</span>
                </div>
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                    <ShoppingCart size={18} />
                </div>
            </div>
        </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        
        {/* 1. HERO SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center h-[300px] md:h-[400px] shadow-xl shadow-blue-900/20">
                <div className="relative z-10 max-w-lg animate-in slide-in-from-left duration-700">
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">FLAGSHIP 2024</span>
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">iPhone 15 Pro Max <br/>Titanium</h1>
                    <p className="text-gray-300 mb-6 line-clamp-2">Chip A17 Pro mạnh mẽ nhất lịch sử. Khung viền Titan chuẩn hàng không vũ trụ.</p>
                    <Link to="/shop?search=iphone" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg hover:scale-105 transform duration-200">
                        Mua ngay <ArrowRight size={18}/>
                    </Link>
                </div>
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
            </div>

            <div className="flex flex-col gap-6 h-full min-h-[400px]">
                <div className="flex-1 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-center shadow-lg group">
                    <div className="relative z-10 group-hover:-translate-y-1 transition duration-300">
                        <h3 className="text-xl font-bold mb-1">Samsung S24 Ultra</h3>
                        <p className="text-xs text-purple-200 mb-3">Quyền năng Galaxy AI</p>
                        <Link to="/shop?search=samsung" className="text-sm font-bold underline hover:text-yellow-300">Khám phá &rarr;</Link>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition duration-700"></div>
                </div>
                
                <div className="flex-1 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-center shadow-lg group">
                    <div className="relative z-10 group-hover:-translate-y-1 transition duration-300">
                         <span className="bg-white text-red-600 text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block shadow-sm">-20%</span>
                        <h3 className="text-xl font-bold mb-1">Xiaomi 14 Series</h3>
                        <p className="text-xs text-orange-100 mb-3">Huyền thoại quang học</p>
                        <Link to="/shop?search=xiaomi" className="text-sm font-bold underline hover:text-yellow-300">Mua ngay &rarr;</Link>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. MENU KHÁM PHÁ (QUICK NAV) */}
        <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <LayoutGrid className="text-blue-600"/> Khám phá PhoneShop
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/shop" className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition group">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                        <Store size={24}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition">Cửa hàng</h3>
                        <p className="text-sm text-gray-500">Xem tất cả sản phẩm</p>
                    </div>
                    <ChevronRight className="ml-auto text-gray-300 group-hover:text-blue-600 transition"/>
                </Link>

                <Link to="/about" className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition group">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition">
                        <Info size={24}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition">Về chúng tôi</h3>
                        <p className="text-sm text-gray-500">Câu chuyện thương hiệu</p>
                    </div>
                    <ChevronRight className="ml-auto text-gray-300 group-hover:text-green-600 transition"/>
                </Link>

                <Link to="/contact" className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition group">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                        <Phone size={24}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition">Liên hệ</h3>
                        <p className="text-sm text-gray-500">Hỗ trợ 24/7</p>
                    </div>
                    <ChevronRight className="ml-auto text-gray-300 group-hover:text-purple-600 transition"/>
                </Link>
            </div>
        </div>

        {/* 3. CAM KẾT DỊCH VỤ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {[
                { icon: Truck, title: "Miễn phí vận chuyển", desc: "Cho đơn từ 5 triệu" },
                { icon: ShieldCheck, title: "Bảo hành chính hãng", desc: "100% Máy mới" },
                { icon: RefreshCw, title: "Đổi trả 30 ngày", desc: "Nếu có lỗi NSX" },
                { icon: Headphones, title: "Hỗ trợ 24/7", desc: "Hotline: 1900 xxxx" },
            ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 border-r last:border-0 border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <item.icon size={20}/>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* 4. THƯƠNG HIỆU */}
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thương hiệu hàng đầu</h2>
            <div className="flex flex-wrap gap-4">
                <Link to="/shop" className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:border-blue-600 hover:text-blue-600 transition shadow-sm">
                    Tất cả
                </Link>
                {brands.map(brand => (
                    <Link 
                        key={brand.id} 
                        to={`/shop?search=${brand.name.toLowerCase()}`}
                        className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:border-blue-600 hover:text-blue-600 transition shadow-sm"
                    >
                        {brand.name}
                    </Link>
                ))}
            </div>
        </div>

        {/* 5. HOT DEAL */}
        <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-800">Giá Sốc Hôm Nay</h2>
                    <div className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        <Zap size={14} className="fill-red-600"/>
                        <span>ĐANG DIỄN RA</span>
                    </div>
                </div>
                <Link to="/shop?sort=price_asc" className="text-sm font-bold text-blue-600 hover:underline flex items-center">Xem tất cả <ChevronRight size={16}/></Link>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {hotProducts.map(p => (
                        <ProductCard key={p.id} product={p} label="GIẢM SÂU" labelColor="bg-red-500" />
                    ))}
                </div>
            )}
        </div>

        {/* 6. BANNER ADS */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white mb-12 h-64 flex items-center group">
            <div className="absolute inset-0 bg-[url('https://plus.unsplash.com/premium_photo-1680985551009-05107cd2752c?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-30 group-hover:scale-105 transition duration-700"></div>
            <div className="relative z-10 px-8 md:px-16 max-w-2xl">
                <span className="text-blue-400 font-bold tracking-widest text-sm mb-2 block">BLACK FRIDAY</span>
                <h2 className="text-3xl md:text-4xl font-black mb-4">Nâng cấp dế yêu <br/> Tiết kiệm tới 50%</h2>
                <button onClick={() => navigate('/shop')} className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">
                    Săn Deal Ngay
                </button>
            </div>
        </div>

        {/* 7. NEW ARRIVALS */}
        <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Sản phẩm mới về</h2>
                <Link to="/shop?sort=newest" className="text-sm font-bold text-blue-600 hover:underline flex items-center">Xem tất cả <ChevronRight size={16}/></Link>
            </div>

            {loading ? (
                <div className="text-center text-gray-400">Đang tải...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {newProducts.map(p => (
                        <ProductCard key={p.id} product={p} label="NEW" labelColor="bg-blue-500" />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}