import { ArrowLeft, Users, Trophy, Target } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
       <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition">
         <ArrowLeft size={20}/> Quay lại trang chủ
       </Link>
       
       <div className="max-w-4xl mx-auto">
         <h1 className="text-4xl font-black text-gray-900 mb-6 text-center">Về PhoneShop</h1>
         <p className="text-xl text-gray-500 text-center mb-16 leading-relaxed">
           Hành trình mang công nghệ đỉnh cao đến với hàng triệu người dùng Việt Nam. 
           Chúng tôi không chỉ bán điện thoại, chúng tôi bán trải nghiệm và sự an tâm.
         </p>

         <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-blue-50 p-8 rounded-3xl text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                    <Trophy size={32}/>
                </div>
                <h3 className="font-bold text-lg mb-2">Uy Tín Hàng Đầu</h3>
                <p className="text-gray-600 text-sm">Top 10 thương hiệu bán lẻ điện tử xuất sắc năm 2024.</p>
            </div>
            <div className="bg-green-50 p-8 rounded-3xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                    <Users size={32}/>
                </div>
                <h3 className="font-bold text-lg mb-2">Khách Hàng Là Trọng Tâm</h3>
                <p className="text-gray-600 text-sm">Phục vụ hơn 50.000 khách hàng hài lòng mỗi năm.</p>
            </div>
            <div className="bg-purple-50 p-8 rounded-3xl text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4">
                    <Target size={32}/>
                </div>
                <h3 className="font-bold text-lg mb-2">Sản Phẩm Chính Hãng</h3>
                <p className="text-gray-600 text-sm">Cam kết 100% sản phẩm chính hãng, bảo hành đầy đủ.</p>
            </div>
         </div>
       </div>
    </div>
  );
}