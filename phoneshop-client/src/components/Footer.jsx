import { Link } from 'react-router-dom';
import { Smartphone, MapPin, Phone, Mail, Facebook, Instagram, Youtube, CreditCard, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 py-16 font-sans">
      <div className="container mx-auto px-4">
        
        {/* TOP SECTION: 4 CỘT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* CỘT 1: THÔNG TIN CHUNG */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6 text-white hover:opacity-80 transition">
               <div className="bg-blue-600 p-2 rounded-lg">
                  <Smartphone size={24} className="text-white"/>
               </div>
               <span className="text-2xl font-bold tracking-tight">PhoneShop</span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Hệ thống bán lẻ điện thoại di động chính hãng uy tín hàng đầu. Cam kết giá tốt nhất, bảo hành chu đáo.
            </p>
            <div className="space-y-3 text-sm">
                <p className="flex items-start gap-3">
                    <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5"/>
                    <span>123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội</span>
                </p>
                <p className="flex items-center gap-3">
                    <Phone size={18} className="text-blue-500 shrink-0"/>
                    <span>Hotline: 1900 1234 (8:00 - 21:00)</span>
                </p>
                <p className="flex items-center gap-3">
                    <Mail size={18} className="text-blue-500 shrink-0"/>
                    <span>support@phoneshop.com.vn</span>
                </p>
            </div>
          </div>

          {/* CỘT 2: SẢN PHẨM & DANH MỤC */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Sản phẩm nổi bật</h3>
            <ul className="space-y-3 text-sm">
                <li><Link to="/shop?search=iphone" className="hover:text-blue-500 transition">iPhone 15 Pro Max</Link></li>
                <li><Link to="/shop?search=samsung" className="hover:text-blue-500 transition">Samsung Galaxy S24</Link></li>
                <li><Link to="/shop?search=xiaomi" className="hover:text-blue-500 transition">Xiaomi 14 Ultra</Link></li>
                <li><Link to="/shop?search=oppo" className="hover:text-blue-500 transition">OPPO Find N3</Link></li>
                <li><Link to="/shop" className="hover:text-blue-500 transition">Xem tất cả điện thoại</Link></li>
            </ul>
          </div>

          {/* CỘT 3: HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3 text-sm">
                <li><Link to="/my-orders" className="hover:text-blue-500 transition">Tra cứu đơn hàng</Link></li>
                <li><Link to="#" className="hover:text-blue-500 transition">Chính sách bảo hành</Link></li>
                <li><Link to="#" className="hover:text-blue-500 transition">Chính sách đổi trả</Link></li>
                <li><Link to="#" className="hover:text-blue-500 transition">Hướng dẫn mua trả góp</Link></li>
                <li><Link to="#" className="hover:text-blue-500 transition">Bảo mật thông tin</Link></li>
            </ul>
          </div>

          {/* CỘT 4: ĐĂNG KÝ & THANH TOÁN */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Đăng ký nhận tin</h3>
            <p className="text-sm text-gray-400 mb-4">Nhận thông tin khuyến mãi mới nhất từ PhoneShop.</p>
            
            <form className="flex gap-2 mb-8">
                <input 
                    type="email" 
                    placeholder="Email của bạn..." 
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
                <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition">
                    <Send size={18}/>
                </button>
            </form>

            <h3 className="text-white font-bold text-lg mb-4">Kết nối với chúng tôi</h3>
            <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                    <Facebook size={20}/>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition">
                    <Instagram size={20}/>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition">
                    <Youtube size={20}/>
                </a>
            </div>
          </div>

        </div>

        <hr className="border-slate-800 mb-8"/>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
                © 2024 PhoneShop. All rights reserved. Designed by You.
            </p>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-500">
                    <CreditCard size={24}/>
                    <span className="text-xs font-semibold">VISA</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <CreditCard size={24}/>
                    <span className="text-xs font-semibold">MasterCard</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <CreditCard size={24}/>
                    <span className="text-xs font-semibold">Momo</span>
                </div>
            </div>
        </div>

      </div>
    </footer>
  );
}