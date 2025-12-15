import { Trash2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../stores/useCartStore";
import toast from "react-hot-toast";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeFromCartStore = useCartStore((state) => state.removeFromCart);
  const clearCartStore = useCartStore((state) => state.clearCart);
  const navigate = useNavigate();

  const handleRemove = (variantId) => {
    removeFromCartStore(variantId);
    toast.error("Đã xóa sản phẩm khỏi giỏ!"); // Thông báo đỏ (Error)
  };

  const handleClear = () => {
    if (confirm("Bạn có chắc muốn xóa hết?")) {
      clearCartStore();
      toast.success("Đã dọn sạch giỏ hàng!");
    }
  };

  // Tính tổng tiền
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Giỏ hàng của bạn đang trống
        </h2>
        <Link
          to="/"
          className="text-blue-600 hover:underline flex items-center"
        >
          <ArrowLeft size={20} className="mr-2" /> Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Giỏ hàng ({items.length} sản phẩm)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.variantId}`}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                  Ảnh
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    Màu: {item.color} | {item.rom}
                  </p>
                  <p className="text-red-600 font-bold">
                    {item.price.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <span className="font-semibold bg-gray-100 px-3 py-1 rounded">
                  x{item.quantity}
                </span>
                <button
                  onClick={() => handleRemove(item.variantId)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleClear}
            className="text-sm text-red-500 hover:underline mt-4"
          >
            Xóa tất cả
          </button>
        </div>

        {/* Tổng tiền & Thanh toán */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">
            Thông tin thanh toán
          </h3>
          <div className="flex justify-between mb-4 text-gray-600">
            <span>Tạm tính:</span>
            <span>{totalAmount.toLocaleString("vi-VN")} ₫</span>
          </div>
          <div className="flex justify-between mb-6 text-xl font-bold text-red-600">
            <span>Tổng cộng:</span>
            <span>{totalAmount.toLocaleString("vi-VN")} ₫</span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Tiến hành đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
}
