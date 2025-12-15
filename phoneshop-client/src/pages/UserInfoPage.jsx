import useAuthStore from '../stores/useAuthStore';
import { UserCircle } from 'lucide-react';

export default function UserInfoPage() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-10 bg-gray-50 min-h-[80vh]">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    <UserCircle size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Hồ sơ của tôi</h2>
                    <p className="text-sm text-gray-500">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                </div>
            </div>

            <form className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                    <input 
                        type="text" 
                        defaultValue={user?.fullName} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                        disabled
                    />
                    <p className="text-xs text-gray-400 mt-1">Vui lòng liên hệ Admin nếu bạn cần đổi tên hiển thị.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                        type="email" 
                        defaultValue={user?.email} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                        disabled
                    />
                </div>
                
                <div className="pt-4 flex justify-end">
                    <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm">
                        Đổi mật khẩu
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  );
}