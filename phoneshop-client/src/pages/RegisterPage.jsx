import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      };

      const res = await axiosClient.post('/account/register', payload);

      if (res.status === 200) {
        toast.success("Đăng ký thành công! Hãy đăng nhập.");
        navigate('/login');
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      
      // --- XỬ LÝ LỖI ---
      if (error.response && error.response.data) {
        const data = error.response.data;
        
        // Trường hợp 1: Backend trả về một mảng lỗi (Identity Errors)
        if (Array.isArray(data)) {
            // Lặp qua từng lỗi và hiện thông báo
            data.forEach(err => {
                toast.error(err.description); // Hiện dòng mô tả lỗi cụ thể
            });
        } 
        // Trường hợp 2: Backend trả về chuỗi lỗi đơn giản
        else if (typeof data === 'string') {
            toast.error(data);
        }
        // Trường hợp 3: Lỗi khác
        else {
             toast.error("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!");
        }
      } else {
        toast.error("Lỗi kết nối đến Server!");
      }
      // -----------------------------
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Đăng Ký Tài Khoản</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input 
              name="fullName" type="text" required
              className="mt-1 w-full p-2 border rounded focus:outline-blue-500"
              placeholder="Nguyễn Văn A"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              name="email" type="email" required
              className="mt-1 w-full p-2 border rounded focus:outline-blue-500"
              placeholder="email@example.com"
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input 
              name="password" type="password" required
              className="mt-1 w-full p-2 border rounded focus:outline-blue-500"
              placeholder="Ít nhất 6 ký tự (Hoa, thường, số)"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
            <input 
              name="confirmPassword" type="password" required
              className="mt-1 w-full p-2 border rounded focus:outline-blue-500"
              placeholder="Nhập lại mật khẩu trên"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold transition mt-4">
            ĐĂNG KÝ
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản? <Link to="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}