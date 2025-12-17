import { ArrowLeft, Mail, MapPin, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition">
            <ArrowLeft size={20}/> Quay lại trang chủ
        </Link>

        <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
                <p className="text-gray-500 mb-8">Chúng tôi luôn sẵn sàng lắng nghe bạn. Hãy để lại tin nhắn hoặc ghé thăm cửa hàng.</p>
                
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                            <MapPin size={24}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Địa chỉ</h3>
                            <p className="text-gray-600">Số 298 Đ. Cầu Diễn, Minh Khai, Bắc Từ Liêm, Hà Nội</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                         <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                            <Phone size={24}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Hotline</h3>
                            <p className="text-gray-600">1900 xxxx (Miễn phí)</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                         <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                            <Mail size={24}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Email</h3>
                            <p className="text-gray-600">support@phoneshop.vn</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Họ tên</label>
                        <input type="text" className="w-full border border-gray-200 p-3 rounded-xl focus:outline-blue-500" placeholder="Nguyễn Văn A"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full border border-gray-200 p-3 rounded-xl focus:outline-blue-500" placeholder="email@example.com"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nội dung</label>
                        <textarea rows="4" className="w-full border border-gray-200 p-3 rounded-xl focus:outline-blue-500" placeholder="Bạn cần hỗ trợ gì?"></textarea>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                        <Send size={18}/> Gửi tin nhắn
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}