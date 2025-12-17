import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, Heart, ArrowRight, Truck, ShieldCheck, 
  Headphones, RefreshCw, Zap, Star, ChevronRight 
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
            // 1. Lấy danh sách hãng
            const brandsRes = await axiosClient.get('/brands');
            setBrands(brandsRes.data);

            // 2. Lấy sản phẩm MỚI NHẤT
            const newRes = await axiosClient.get('/products?page=1&limit=8&sort=newest');
            setNewProducts(newRes.data.items);

            // 3. Lấy sản phẩm GIÁ RẺ/HOT 
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

  // Component Card Sản phẩm
  const ProductCard = ({ product, label, labelColor }) => (
    <Link to={`/product/${product.id}`} className="group h-full">
        <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col hover:-translate-y-1 relative">
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
                
                {/* Nhãn (Hot/New) */}
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
                
                {/* Đánh giá giả lập */}
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
                <button className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    <ShoppingCart size={18} />
                </button>
            </div>
        </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="container mx-auto px-4 py-6">
        
        {/* 1. HERO SECTION (GRID LAYOUT) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Banner Chính (Chiếm 2/3) */}
            <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center h-[300px] md:h-[400px]">
                <div className="relative z-10 max-w-lg">
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">FLAGSHIP 2024</span>
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">iPhone 15 Pro Max <br/>Titanium</h1>
                    <p className="text-gray-300 mb-6 line-clamp-2">Chip A17 Pro mạnh mẽ nhất lịch sử. Khung viền Titan chuẩn hàng không vũ trụ.</p>
                    <Link to="/shop?search=iphone" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition">
                        Mua ngay <ArrowRight size={18}/>
                    </Link>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600 blur-[100px] opacity-50 rounded-full"></div>
            </div>

            {/* 2 Banner Phụ (Bên phải) */}
            <div className="flex flex-col gap-6 h-[400px]">
                <div className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-1">Samsung S24 Ultra</h3>
                        <p className="text-xs text-purple-200 mb-3">Quyền năng Galaxy AI</p>
                        <Link to="/shop?search=samsung" className="text-sm font-bold underline hover:text-yellow-300">Khám phá</Link>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
                </div>
                
                <div className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10">
                         <span className="bg-white text-red-600 text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block">-20%</span>
                        <h3 className="text-xl font-bold mb-1">Xiaomi 14 Series</h3>
                        <p className="text-xs text-orange-100 mb-3">Huyền thoại quang học</p>
                        <Link to="/shop?search=xiaomi" className="text-sm font-bold underline hover:text-yellow-300">Mua ngay</Link>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. SERVICE BAR (CAM KẾT) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {[
                { icon: Truck, title: "Miễn phí vận chuyển", desc: "Cho đơn từ 5 triệu" },
                { icon: ShieldCheck, title: "Bảo hành chính hãng", desc: "100% Máy mới" },
                { icon: RefreshCw, title: "Đổi trả 30 ngày", desc: "Nếu có lỗi NSX" },
                { icon: Headphones, title: "Hỗ trợ 24/7", desc: "Hotline: 1900 xxxx" },
            ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2">
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

        {/* 3. THƯƠNG HIỆU NỔI BẬT */}
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

        {/* 4. FLASH SALE / HOT DEAL */}
        <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-800">Giá Sốc Hôm Nay</h2>
                    <div className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
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

        {/* 5. BANNER QUẢNG CÁO GIỮA TRANG */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white mb-12 h-64 flex items-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556656793-02715d8dd655?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
            <div className="relative z-10 px-8 md:px-16 max-w-2xl">
                <span className="text-blue-400 font-bold tracking-widest text-sm mb-2 block">BLACK FRIDAY</span>
                <h2 className="text-3xl md:text-4xl font-black mb-4">Nâng cấp dế yêu <br/> Tiết kiệm tới 50%</h2>
                <button onClick={() => navigate('/shop')} className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
                    Săn Deal Ngay
                </button>
            </div>
        </div>

        {/* 6. SẢN PHẨM MỚI (NEW ARRIVALS) */}
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
        
        {/* Banner cuối: Kêu gọi tải app hoặc đăng ký (Optional) */}
        <div className="bg-blue-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Bạn chưa tìm thấy sản phẩm ưng ý?</h3>
            <p className="text-blue-100 mb-6">Xem thêm hơn 100+ mẫu điện thoại khác tại cửa hàng của chúng tôi.</p>
            <Link to="/shop" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition">
                Đến Cửa Hàng Ngay
            </Link>
        </div>

      </div>
    </div>
  );
}