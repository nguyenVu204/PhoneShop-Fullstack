import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../stores/useCartStore';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  
  // Tính tổng tiền hiển thị
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // State lưu form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Nếu giỏ hàng trống thì đá về trang chủ
  if (items.length === 0) {
      navigate('/');
      return null;
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Chặn reload trang

    try {
      // 1. Chuẩn bị dữ liệu gửi lên API
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      };

      // 2. Gọi API
      const res = await axiosClient.post('/orders', orderData);

      if (res.status === 200) {
        toast.success("Đặt hàng thành công! Cảm ơn bạn.");
        clearCart(); // Xóa sạch giỏ hàng
        navigate('/'); // Về trang chủ
      }
    } catch (error) {
      console.error(error);
      toast.error("Đặt hàng thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Xác nhận đơn hàng</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Cột trái: Form nhập liệu */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-lg font-bold mb-4">Thông tin giao hàng</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Họ tên</label>
              <input 
                required name="name" type="text" 
                className="w-full border p-2 rounded focus:outline-blue-500"
                placeholder="Nguyễn Văn A"
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <input 
                required name="phone" type="text" 
                className="w-full border p-2 rounded focus:outline-blue-500"
                placeholder="0987654321"
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ nhận hàng</label>
              <textarea 
                required name="address" rows="3"
                className="w-full border p-2 rounded focus:outline-blue-500"
                placeholder="Số 1, Đường ABC..."
                onChange={handleInputChange}
              ></textarea>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mt-4">
              XÁC NHẬN ĐẶT HÀNG
            </button>
          </form>
        </div>

        {/* Cột phải: Tóm tắt đơn hàng */}
        <div className="bg-gray-50 p-6 rounded-lg border h-fit">
          <h2 className="text-lg font-bold mb-4">Đơn hàng của bạn</h2>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-500">{item.color} - {item.rom} (x{item.quantity})</p>
                </div>
                <div className="font-medium">
                  {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between text-xl font-bold text-red-600">
            <span>Tổng cộng:</span>
            <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>
    </div>
  );
}