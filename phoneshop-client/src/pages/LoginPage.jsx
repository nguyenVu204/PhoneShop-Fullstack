import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; // Dùng để giải mã token
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import useAuthStore from '../stores/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Gọi API Login
      const res = await axiosClient.post('/account/login', formData);
      
      // 2. Lấy Token từ kết quả trả về
      const token = res.data.token;
      
      // 3. Giải mã Token để lấy thông tin User (Tên, Email...)
      const decodedUser = jwtDecode(token);
      const role = decodedUser['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedUser.role;
      console.log(role)
      console.log("Thông tin giải mã:", decodedUser);

      // Lưu ý: Key trong token thường là chữ thường hoặc theo chuẩn claim
      // Ví dụ: decodedUser.fullName hoặc decodedUser['fullName'] tùy backend
      // Ở backend mình đã claim "fullName", nên ở đây lấy ra được.
      
      const userData = {
        email: decodedUser.email || decodedUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        fullName: decodedUser.fullName, 
        id: decodedUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        role: role
      };

      // 4. Lưu vào Store
      login(userData, token);
      
      if (role === 'Admin') {
          toast.success("Xin chào Admin! Đang vào trang quản trị...");
          navigate('/admin');
      } else {
          toast.success(`Chào mừng quay lại, ${userData.fullName}!`);
          navigate('/');
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Đăng nhập thất bại! Sai email hoặc mật khẩu.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Đăng Nhập</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" required
              className="mt-1 w-full p-2 border rounded focus:outline-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input 
              type="password" required
              className="mt-1 w-full p-2 border rounded focus:outline-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold transition">
            ĐĂNG NHẬP
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="text-blue-600 font-bold hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}