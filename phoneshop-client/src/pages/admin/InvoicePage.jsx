import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import useAuthStore from '../../stores/useAuthStore';

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const isAdmin = user?.role === 'Admin' || user?.roles?.includes('Admin');
  const backLink = isAdmin ? '/admin/orders' : '/my-orders';

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await axiosClient.get(`/orders/${id}`);
        if (res.data) {
          setOrder(res.data);
        } else {
          toast.error("Không tìm thấy dữ liệu đơn hàng!");
        }
      } catch (error) {
        console.error("Lỗi fetch invoice:", error);
        toast.error("Không thể tải thông tin hóa đơn!");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrderDetail();
  }, [id]);

  const handlePrint = async () => {
    setIsPrinting(true);
    const invoiceElement = document.getElementById('invoice-content');
    
    try {
      const canvas = await html2canvas(invoiceElement, { 
        scale: 3, 
        useCORS: true, 
        logging: false 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Hoa-don-TechMobile-${order.id}.pdf`);
      toast.success("Đã tải xuống hóa đơn!");
    } catch (error) {
      toast.error("Không thể tạo file PDF");
    } finally {
      setIsPrinting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium animate-pulse">Đang tạo hóa đơn...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-red-600 font-bold text-lg">Đơn hàng không tồn tại hoặc đã bị xóa.</div>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 md:p-8 flex flex-col items-center font-sans">
      {/* Toolbar */}
      <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center md:flex-row flex-col gap-4 no-print">
        <Link 
          to={backLink} 
          className="flex items-center text-gray-700 hover:text-gray-900 transition font-medium bg-white px-5 py-2.5 rounded-lg border border-gray-300"
        >
          <ArrowLeft size={20} className="mr-2" /> Quay lại
        </Link>

        <button 
          onClick={handlePrint} 
          disabled={isPrinting} 
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-800 transition disabled:opacity-50 shadow-sm"
        >
          <Printer size={20} />
          {isPrinting ? "Đang xử lý..." : "Tải PDF / In Hóa đơn"}
        </button>
      </div>

      {/* === HÓA ĐƠN A4 === */}
      <div 
        id="invoice-content" 
        className="bg-white w-[210mm] min-h-[297mm] p-10 shadow-xl text-slate-800 border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between border-b border-gray-800 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                <span className="text-2xl font-black">TM</span>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter">TECHMOBILE</h1>
                <p className="text-xs text-gray-500 font-medium">CỬA HÀNG ĐIỆN THOẠI CHÍNH HÃNG</p>
              </div>
            </div>

            <div className="mt-6 text-sm space-y-1 text-gray-600">
              <p>123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội</p>
              <p>Hotline: 1900 1234 | Email: support@techmobile.vn</p>
              <p>Website: www.techmobile.vn</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-5xl font-black text-gray-300 tracking-widest mb-1">HÓA ĐƠN</h2>
            <p className="text-xl font-bold">#{order.id}</p>
            <p className="text-sm mt-1">
              Ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN', { 
                day: '2-digit', month: '2-digit', year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Thông tin khách hàng & giao hàng */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Thông tin khách hàng</h3>
            <div className="border border-gray-300 p-5">
              <p className="font-semibold text-lg">{order.customerName}</p>
              <p className="text-gray-600 mt-1">{order.customerPhone}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Địa chỉ giao hàng</h3>
            <div className="border border-gray-300 p-5 h-full">
              <p className="text-sm leading-relaxed">{order.shippingAddress}</p>
            </div>
          </div>
        </div>

        {/* Bảng sản phẩm */}
        <table className="w-full border border-gray-800 text-sm mb-10">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-800">
              <th className="p-4 text-left font-semibold border-r border-gray-300">Sản phẩm</th>
              <th className="p-4 text-right font-semibold border-r border-gray-300 w-32">Đơn giá</th>
              <th className="p-4 text-center font-semibold border-r border-gray-300 w-20">Số lượng</th>
              <th className="p-4 text-right font-semibold w-40">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.orderDetails?.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 border-r border-gray-300">
                  <p className="font-medium">{item.productVariant?.product?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.productVariant?.color} - {item.productVariant?.rom}
                  </p>
                  {item.serialNumber && (
                    <p className="text-[10px] font-mono text-gray-400 mt-1">
                      IMEI: {item.serialNumber}
                    </p>
                  )}
                </td>
                <td className="p-4 text-right border-r border-gray-300">
                  {item.unitPrice.toLocaleString('vi-VN')} ₫
                </td>
                <td className="p-4 text-center border-r border-gray-300">
                  {item.quantity}
                </td>
                <td className="p-4 text-right font-semibold">
                  {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} ₫
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tổng tiền */}
        <div className="flex justify-end">
          <div className="w-96">
            <div className="flex justify-between py-2 text-sm">
              <span>Tạm tính</span>
              <span>{order.totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span>Phí vận chuyển</span>
              <span>0 ₫</span>
            </div>
            <div className="border-t border-gray-800 pt-3 mt-2 flex justify-between items-center font-bold text-lg">
              <span>TỔNG CỘNG</span>
              <span>{order.totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
            <p className="text-right text-xs text-gray-500 mt-1">(Đã bao gồm VAT)</p>
          </div>
        </div>

        {/* Điều khoản & Chính sách */}
        <div className="mt-16 pt-8 border-t border-gray-300 text-xs leading-relaxed text-gray-600">
          <p className="font-bold text-gray-800 mb-3">ĐIỀU KHOẢN &amp; CHÍNH SÁCH</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="font-semibold mb-1">1. Kiểm tra hàng hóa</p>
              <p className="pl-4">Quý khách vui lòng kiểm tra kỹ hàng hóa trước khi thanh toán. TechMobile chỉ chịu trách nhiệm đổi trả khi có lỗi kỹ thuật từ nhà sản xuất.</p>
            </div>
            
            <div>
              <p className="font-semibold mb-1">2. Chính sách đổi trả</p>
              <p className="pl-4">Hàng lỗi do nhà sản xuất: đổi mới trong 30 ngày. Không áp dụng đổi trả với các sản phẩm đã kích hoạt hoặc có dấu hiệu sử dụng.</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="font-semibold mb-1">3. Thanh toán &amp; Giao hàng</p>
            <p className="pl-4">Thanh toán khi nhận hàng (COD) hoặc chuyển khoản. Giao hàng toàn quốc. Thời gian bảo hành theo chính sách của từng hãng.</p>
          </div>

          <p className="text-center mt-12 text-gray-400 text-[10px]">
            Hóa đơn điện tử • TechMobile • Được tạo tự động ngày {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
}