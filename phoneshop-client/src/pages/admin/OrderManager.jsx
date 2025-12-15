import { useEffect, useState } from "react";
import { Eye, X, Search, FileDown, FileText, ChevronLeft, ChevronRight } from "lucide-react"; // Thêm icon Chevron
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function OrderManager() {
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // State quản lý Tìm kiếm & Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Tổng số đơn tìm thấy

  const navigate = useNavigate();

  // 1. Debounce Search (Chờ 500ms sau khi ngừng gõ mới tìm)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset về trang 1 khi tìm mới
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Fetch API mỗi khi [debouncedSearch] hoặc [page] thay đổi
  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/orders?search=${debouncedSearch}&page=${page}&limit=10`);
      // Backend trả về: { items, totalPages, totalItems, ... }
      setOrders(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalItems);
      setLoading(false);
    } catch (error) {
      toast.error("Lỗi tải danh sách đơn hàng!");
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosClient.put(
        `/orders/${orderId}/status`,
        JSON.stringify(newStatus),
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success(`Cập nhật #${orderId} thành công!`);
      
      // Cập nhật lại giao diện (local update cho nhanh)
      const updatedOrders = orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      setOrders(updatedOrders);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error("Cập nhật thất bại!");
    }
  };

  const handleExport = async () => {
    try {
      const response = await axiosClient.get("/orders/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Orders_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Đã xuất báo cáo đơn hàng!");
    } catch (error) {
      toast.error("Lỗi xuất file!");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Shipping": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Completed": return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <div>
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Đơn hàng</h1>
          <p className="text-slate-500 text-sm">
             Tìm thấy <span className="font-bold text-blue-600">{totalItems}</span> đơn hàng
          </p>
        </div>
        
        <div className="flex gap-3 items-center w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Tìm mã đơn, tên khách, SĐT..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <button 
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition whitespace-nowrap"
            >
                <FileDown size={18} />
                <span className="hidden md:inline">Excel</span>
            </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
         <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Mã đơn</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Khách hàng</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Ngày đặt</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tổng tiền</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr>
                    <td colSpan="6" className="text-center py-20 text-gray-400">Đang tải dữ liệu...</td>
                 </tr>
              ) : orders.length === 0 ? (
                 <tr>
                    <td colSpan="6" className="text-center py-20 text-gray-400">Không tìm thấy đơn hàng nào.</td>
                 </tr>
              ) : (
                orders.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                        <td className="p-4 font-bold text-gray-700">#{order.id}</td>
                        <td className="p-4">
                            <p className="font-semibold text-gray-800 text-sm">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{order.customerPhone}</p>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                            {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                            {order.totalAmount.toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="p-4">
                            <select
                                className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold border ring-1 cursor-pointer focus:outline-none focus:ring-2 ${getStatusStyle(order.status)}`}
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                                <option value="Pending">Chờ xử lý</option>
                                <option value="Shipping">Đang giao</option>
                                <option value="Completed">Hoàn thành</option>
                                <option value="Cancelled">Hủy đơn</option>
                            </select>
                        </td>
                        <td className="p-4 text-center">
                            <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition shadow-sm"
                            >
                                <Eye size={18} />
                            </button>
                        </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER PHÂN TRANG */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-2 bg-gray-50/30">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 border rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:shadow-none transition"
                >
                    <ChevronLeft size={20} className="text-gray-600"/>
                </button>

                {/* Dãy số trang */}
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                            page === i + 1
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 border rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:shadow-none transition"
                >
                    <ChevronRight size={20} className="text-gray-600"/>
                </button>
            </div>
        )}
      </div>

      {/* --- MODAL CHI TIẾT (Giữ nguyên như cũ) --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-50/80 px-6 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Đơn hàng #{selectedOrder.id}
                </h2>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusStyle(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/admin/orders/${selectedOrder.id}/invoice`)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                >
                  <FileText size={16} />
                  Xem Hóa đơn
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
               <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Khách hàng</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Địa chỉ</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="p-3 font-medium">Sản phẩm</th>
                      <th className="p-3 font-medium text-right">Giá</th>
                      <th className="p-3 font-medium text-right">SL</th>
                      <th className="p-3 font-medium text-right">Tổng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.orderDetails.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <p className="font-medium text-gray-800">{item.productVariant?.product?.name}</p>
                          <p className="text-xs text-gray-500">{item.productVariant?.color} - {item.productVariant?.rom}</p>
                        </td>
                        <td className="p-3 text-right">{item.unitPrice.toLocaleString()}</td>
                        <td className="p-3 text-right">x{item.quantity}</td>
                        <td className="p-3 text-right font-bold">{(item.unitPrice * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}