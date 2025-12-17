import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { CheckCircle, XCircle, Home, ShoppingBag } from "lucide-react";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, failed
  const [message, setMessage] = useState("Đang xử lý thanh toán...");

  useEffect(() => {
    // Lấy toàn bộ params từ URL do VNPay trả về
    const params = Object.fromEntries([...searchParams]);

    const verifyPayment = async () => {
      try {
        // Gọi API Backend để kiểm tra chữ ký và cập nhật đơn hàng
        const res = await axiosClient.get("/payment/payment-callback", {
          params: params,
        });

        if (res.data.success) {
          setStatus("success");
          setMessage("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.");
        } else {
          setStatus("failed");
          setMessage("Thanh toán thất bại hoặc bị hủy. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error(error);
        setStatus("failed");
        setMessage("Có lỗi xảy ra trong quá trình xử lý.");
      }
    };

    if (Object.keys(params).length > 0) {
      verifyPayment();
    } else {
      setStatus("failed");
      setMessage("Không tìm thấy thông tin thanh toán.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800">Đang xử lý giao dịch...</h2>
            <p className="text-gray-500 mt-2">Vui lòng không tắt trình duyệt.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <CheckCircle size={80} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            
            <div className="flex gap-4 w-full">
              <Link to="/my-orders" className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2">
                <ShoppingBag size={18}/> Đơn hàng
              </Link>
              <Link to="/" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Home size={18}/> Trang chủ
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <XCircle size={80} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            
            <div className="flex gap-4 w-full">
               <Link to="/" className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                Về trang chủ
              </Link>
              <Link to="/cart" className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                Thử lại
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}