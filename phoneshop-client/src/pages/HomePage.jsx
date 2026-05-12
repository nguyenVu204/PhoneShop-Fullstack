import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, Heart, ArrowRight, Truck, ShieldCheck, 
  Headphones, RefreshCw, Zap, Star, ChevronRight, ChevronLeft,
  Tag, TrendingUp, Award, Clock, Gift, Eye, Search, Smartphone, Shield, CreditCard, Newspaper,
  ChevronRight as ChevronIcon, Laptop, Tablet, Watch, Headphones as AudioIcon, Cpu
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import useFavoriteStore from '../stores/useFavoriteStore';
import NewsCard from "../components/NewsCard";

/* ─── COUNTDOWN TIMER ─── */
function CountdownTimer({ targetHours = 8 }) {
  const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 });
  useEffect(() => {
    const tick = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);
  const pad = n => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1.5">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="bg-white text-red-600 font-mono font-black text-sm px-2 py-1 rounded shadow-sm min-w-[32px] text-center">{v}</span>
          {i < 2 && <span className="text-white font-black text-lg">:</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── PRODUCT CARD (UPDATED FOR PROMO) ─── */
function ProductCard({ product, label, labelColor, badge }) {
  const { favoriteIds, toggleFavorite } = useFavoriteStore();
  const isFav = favoriteIds.includes(product.id);

  // Tính % giảm giá nếu có
  const hasPromo = product.minDiscountPrice && product.minDiscountPrice > 0;
  const discountPercent = hasPromo 
    ? Math.round(((product.minPrice - product.minDiscountPrice) / product.minPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="group h-full block">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-blue-100/60 transition-all duration-500 border border-gray-100 h-full flex flex-col relative overflow-hidden hover:-translate-y-1.5">
        
        {/* Discount Badge */}
        {hasPromo && (
          <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg animate-bounce">
            GIẢM {discountPercent}%
          </div>
        )}

        {/* Heart Button */}
        <button
          onClick={e => { e.preventDefault(); toggleFavorite(product.id); }}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-sm border transition-all duration-300 ${isFav ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white/90 border-gray-100 hover:border-red-200 text-gray-300'}`}
        >
          <Heart size={16} className={isFav ? "fill-current" : ""} />
        </button>

        {/* Image Area */}
        <div className="relative h-52 bg-white flex items-center justify-center p-6 overflow-hidden rounded-t-2xl">
          {product.thumbnail
            ? <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
            : <span className="text-gray-300 text-xs">No image</span>}
        </div>

        {/* Info Area */}
        <div className="flex-1 flex flex-col p-4 pt-0">
          <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{product.brandName}</p>
          <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
          
          <div className="mt-auto">
            {hasPromo ? (
              <div className="space-y-0.5">
                <div className="text-red-600 font-black text-lg">
                  {product.minDiscountPrice.toLocaleString("vi-VN")} ₫
                </div>
                <div className="text-gray-400 text-xs line-through">
                  {product.minPrice.toLocaleString("vi-VN")} ₫
                </div>
              </div>
            ) : (
              <div className="text-blue-600 font-black text-lg">
                {product.minPrice?.toLocaleString("vi-VN")} ₫
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
             <div className="flex items-center gap-1 text-amber-400">
                <Star size={12} fill="currentColor"/>
                <span className="text-gray-400 text-[10px] font-bold">5.0</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ShoppingCart size={14} />
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── NEW HERO SECTION (SIDEBAR + SLIDER) ─── */
const menuCategories = [
  { icon: Smartphone, name: "Điện thoại iPhone", link: "/shop?search=iphone" },
  { icon: Smartphone, name: "Điện thoại Samsung", link: "/shop?search=samsung" },
  { icon: Smartphone, name: "Điện thoại Xiaomi", link: "/shop?search=xiaomi" },
  { icon: Smartphone, name: "Điện thoại OPPO", link: "/shop?search=oppo" },
  { icon: Smartphone, name: "Điện thoại Vivo", link: "/shop?search=vivo" },
  { icon: Smartphone, name: "Điện thoại Realme", link: "/shop?search=realme" },
  { icon: RefreshCw, name: "Máy cũ / Thu đổi", link: "/shop?sort=price_asc" },
];

const bannerSlides = [
  { img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070", title: "iPhone 16 Series", sub: "Mở bán ưu đãi đến 5 triệu" },
  { img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2070", title: "Galaxy S24 Ultra", sub: "Quyền năng AI đỉnh cao" },
];

function HeroSection() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % bannerSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      {/* Sidebar Menu - Chỉ hiện trên màn hình lớn */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="py-2">
          {menuCategories.map((item, idx) => (
            <Link key={idx} to={item.link} className="flex items-center justify-between px-5 py-3 hover:bg-blue-50 hover:text-blue-600 transition-colors text-slate-700 font-semibold text-sm">
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-slate-400 group-hover:text-blue-600"/>
                {item.name}
              </div>
              <ChevronIcon size={14} className="text-slate-300"/>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Slider (Chiếm 3/4) */}
      <div className="lg:col-span-3 h-[300px] md:h-[400px] relative rounded-2xl overflow-hidden shadow-lg group">
        {bannerSlides.map((slide, idx) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === current ? 'opacity-100' : 'opacity-0'}`}>
            <img src={slide.img} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent flex flex-col justify-center px-12 text-white">
               <h2 className="text-4xl md:text-5xl font-black mb-2">{slide.title}</h2>
               <p className="text-xl font-bold text-blue-400">{slide.sub}</p>
               <Link to="/shop" className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full font-black w-fit hover:bg-blue-700 transition">Mua ngay</Link>
            </div>
          </div>
        ))}
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/40'}`}></button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const navigate = useNavigate();
  const [newProducts, setNewProducts] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Lấy danh sách sản phẩm (Tùy chỉnh API để lấy đúng data khuyến mãi)
        const [brandsRes, newRes, newsRes, promoRes] = await Promise.all([
          axiosClient.get('/brands'),
          axiosClient.get('/products?page=1&limit=8&sort=newest'),
          axiosClient.get('/news?page=1&limit=3'),
          // Giả sử ta lấy sản phẩm có minDiscountPrice > 0 cho Flash Sale
          axiosClient.get('/products?page=1&limit=10&sort=price_asc'), 
        ]);
        setBrands(brandsRes.data);
        setNewProducts(newRes.data.items);
        setLatestNews(newsRes.data.items);
        // Filter local nếu backend chưa hỗ trợ api/products/promotions
        const sales = promoRes.data.items.filter(p => p.minDiscountPrice > 0);
        setPromoProducts(sales.length > 0 ? sales : promoRes.data.items.slice(0, 4));
      } catch (e) {
        console.error("Lỗi tải trang chủ", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6">
        
        {/* 1. HERO SECTION */}
        <HeroSection />

        {/* 2. TRUST BADGES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: ShieldCheck, title: "Chính hãng 100%", sub: "Bảo hành 12 tháng" },
            { icon: Truck, title: "Giao nhanh 2h", sub: "Miễn phí nội thành" },
            { icon: RefreshCw, title: "Lỗi là đổi mới", sub: "Trong vòng 30 ngày" },
            { icon: Headphones, title: "Hỗ trợ 24/7", sub: "Giải đáp mọi thắc mắc" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-50">
              <div className="text-blue-600"><item.icon size={28} strokeWidth={1.5}/></div>
              <div>
                <p className="font-bold text-sm text-slate-800">{item.title}</p>
                <p className="text-[11px] text-slate-400 font-medium">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. FLASH SALE SECTION - SIÊU NỔI BẬT */}
        <div className="mb-14 bg-red-600 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="animate-pulse bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                <Zap size={32} className="text-yellow-400 fill-yellow-400"/>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter">FLASH SALE ĐANG DIỄN RA</h2>
                <div className="mt-2"><CountdownTimer targetHours={5}/></div>
              </div>
            </div>
            <Link to="/shop?sort=price_asc" className="bg-white text-red-600 px-8 py-3 rounded-full font-black hover:bg-yellow-400 hover:text-red-700 transition shadow-lg">XEM TẤT CẢ ƯU ĐÃI</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading ? [1,2,3,4,5].map(i => <div key={i} className="h-64 bg-white/20 animate-pulse rounded-2xl"></div>) : 
              promoProducts.slice(0, 5).map(p => (
                <ProductCard key={p.id} product={p} label="SALE" labelColor="bg-red-600" badge />
              ))
            }
          </div>
        </div>

        {/* 4. BRAND FILTER */}
        <div className="mb-14">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-black text-slate-900 uppercase">Thương hiệu đình đám</h2>
           </div>
           <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {brands.map(brand => (
                <button key={brand.id} onClick={() => navigate(`/shop?brand=${brand.id}`)} className="bg-white border border-gray-200 py-4 rounded-xl hover:border-blue-600 hover:shadow-md transition group">
                   <span className="font-black text-slate-600 group-hover:text-blue-600">{brand.name}</span>
                </button>
              ))}
           </div>
        </div>

        {/* 5. NEW ARRIVALS */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sản phẩm mới về</h2>
            </div>
            <Link to="/shop?sort=newest" className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-sm">Xem tất cả <ChevronRight size={16}/></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>

        {/* 6. PROMO ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
           <div className="h-48 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white flex flex-col justify-center shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2">THU CŨ ĐỔI MỚI</h3>
                <p className="text-blue-100 font-medium mb-4">Trợ giá lên đời đến 5.000.000đ cho iPhone 16</p>
                <Link to="/shop" className="text-sm font-black bg-white text-blue-600 px-6 py-2.5 rounded-lg w-fit">KHÁM PHÁ NGAY</Link>
              </div>
              <Smartphone size={120} className="absolute right-[-20px] bottom-[-20px] text-white/10 group-hover:rotate-12 transition-transform"/>
           </div>
           <div className="h-48 rounded-2xl bg-gradient-to-r from-purple-700 to-purple-500 p-8 text-white flex flex-col justify-center shadow-lg relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2">TRẢ GÓP 0% LÃI SUẤT</h3>
                <p className="text-purple-100 font-medium mb-4">Duyệt hồ sơ nhanh qua thẻ tín dụng/Căn cước</p>
                <Link to="/shop" className="text-sm font-black bg-white text-purple-600 px-6 py-2.5 rounded-lg w-fit">ĐĂNG KÝ NGAY</Link>
              </div>
              <CreditCard size={120} className="absolute right-[-20px] bottom-[-20px] text-white/10 group-hover:-rotate-12 transition-transform"/>
           </div>
        </div>

        {/* 7. NEWS SECTION */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-slate-900 rounded-full"></div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">TechNews 24/7</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map(item => <NewsCard key={item.id} item={item} />)}
          </div>
        </div>

      </div>
    </div>
  );
}