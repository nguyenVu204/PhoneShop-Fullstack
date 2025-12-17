import { useEffect, useState } from "react";
import { User, Phone, Mail, Save, Camera } from "lucide-react";
import useAuthStore from "../stores/useAuthStore";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  
  // State form
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "", // Email thường không cho sửa
  });

  const [loading, setLoading] = useState(false);

  // Load dữ liệu từ Store vào Form khi vào trang
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gọi API cập nhật
      const res = await axiosClient.put("/account/profile", {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber
      });

      // API trả về user mới -> Cập nhật vào Store ngay
      updateUser(res.data.user);
      
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center py-20">Vui lòng đăng nhập.</div>;

  return (
    <div className="container mx-auto px-4 py-10 min-h-[80vh] bg-gray-50 flex justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full h-fit">
        
        {/* Header Avatar (Giả lập) */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3 relative">
                <span className="text-3xl font-bold">{formData.fullName.charAt(0).toUpperCase()}</span>
                <button className="absolute bottom-0 right-0 bg-gray-800 text-white p-1.5 rounded-full hover:bg-black transition">
                    <Camera size={14}/>
                </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{formData.fullName}</h1>
            <p className="text-gray-500 text-sm">{formData.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (Readonly) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        value={formData.email} 
                        disabled 
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Họ tên */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        required
                        value={formData.fullName} 
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Nhập họ tên của bạn"
                    />
                </div>
            </div>

            {/* Số điện thoại */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        required
                        value={formData.phoneNumber} 
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Nhập số điện thoại"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70"
            >
                {loading ? "Đang lưu..." : (
                    <>
                        <Save size={18}/> Lưu thay đổi
                    </>
                )}
            </button>
        </form>

      </div>
    </div>
  );
}