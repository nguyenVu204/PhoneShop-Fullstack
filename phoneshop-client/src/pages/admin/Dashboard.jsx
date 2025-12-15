import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp, Calendar, Download, Printer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosClient from '../../api/axiosClient';

// Import thư viện xuất PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    chartData: []
  });
  
  const [timeframe, setTimeframe] = useState('week');
  const [isExporting, setIsExporting] = useState(false); // State để hiện loading khi đang xuất

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  const fetchStats = async () => {
    try {
        const res = await axiosClient.get(`/stats?timeframe=${timeframe}`);
        setStats(res.data);
    } catch (error) {
        console.error("Lỗi tải thống kê:", error);
    }
  };

  // --- HÀM XUẤT PDF ---
  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('dashboard-content'); // Lấy phần tử cần in

    try {
        // 1. Tạo ảnh từ HTML (tăng scale lên 2 để ảnh nét hơn)
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        // 2. Tạo file PDF (A4, Portrait)
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // 3. Tính toán kích thước để ảnh vừa khít trang A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Tỷ lệ khung hình
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        const imgX = (pdfWidth - imgWidth * ratio) / 2; // Căn giữa
        const imgY = 10; // Cách lề trên 10mm

        // 4. Thêm ảnh vào PDF
        // Tham số: ảnh, định dạng, x, y, chiều rộng, chiều cao
        pdf.addImage(imgData, 'PNG', 0, imgY, pdfWidth, (imgHeight * pdfWidth) / imgWidth);
        
        // 5. Lưu file
        pdf.save(`Bao-cao-doanh-thu-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("Đã xuất báo cáo thành công!");
    } catch (error) {
        console.error("Lỗi xuất PDF:", error);
        toast.error("Không thể xuất PDF");
    } finally {
        setIsExporting(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${bgClass} ${colorClass}`}>
        <Icon size={28} />
      </div>
    </div>
  );

  return (
    <div>
      {/* HEADER & ACTIONS */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Tổng quan kinh doanh</h1>
            <p className="text-slate-500">Số liệu cập nhật mới nhất hôm nay.</p>
        </div>
        
        <div className="flex gap-3">
            {/* NÚT CHỌN THỜI GIAN */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center shadow-sm h-10">
                <div className="px-3 text-gray-400">
                    <Calendar size={18} />
                </div>
                <select 
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer py-1 pr-8 outline-none"
                >
                    <option value="week">7 ngày qua</option>
                    <option value="month">Tháng này</option>
                    <option value="year">Năm nay</option>
                </select>
            </div>

            {/* NÚT XUẤT PDF */}
            <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition flex items-center gap-2 shadow-lg shadow-slate-800/20 disabled:opacity-70 h-10"
            >
                {isExporting ? (
                    <span>Đang tạo...</span>
                ) : (
                    <>
                        <Download size={18} />
                        <span>Xuất PDF</span>
                    </>
                )}
            </button>
        </div>
      </div>
      
      {/* --- KHU VỰC CẦN IN (Bọc id="dashboard-content" vào đây) --- */}
      <div id="dashboard-content" className="space-y-8 bg-gray-50 p-4 rounded-xl"> 
        {/* Lưu ý: Thêm padding và bg để khi in ra PDF nhìn nó đẹp như 1 trang giấy */}
        
        {/* Tiêu đề cho file PDF (Chỉ hiện khi in, nhưng ở đây ta để luôn cũng được) */}
        <div className="text-center pb-4 border-b border-gray-200 mb-4 hidden print:block">
            <h2 className="text-3xl font-bold uppercase text-slate-800">Báo cáo doanh thu PhoneShop</h2>
            <p className="text-gray-500">Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>

        {/* 3 THẺ STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
            title="Tổng Doanh thu" 
            value={`${stats.totalRevenue.toLocaleString('vi-VN')} ₫`} 
            icon={DollarSign} 
            colorClass="text-blue-600" 
            bgClass="bg-blue-50"
            />
            <StatCard 
            title="Tổng Đơn hàng" 
            value={stats.totalOrders} 
            icon={ShoppingBag} 
            colorClass="text-green-600" 
            bgClass="bg-green-50"
            />
            <StatCard 
            title="Sản phẩm tồn kho" 
            value={stats.totalProducts} 
            icon={Package} 
            colorClass="text-purple-600" 
            bgClass="bg-purple-50"
            />
        </div>

        {/* BIỂU ĐỒ DOANH THU */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h3>
                        <p className="text-xs text-gray-400">
                            {timeframe === 'week' && 'Hiển thị xu hướng 7 ngày gần nhất'}
                            {timeframe === 'month' && 'Hiển thị từng ngày trong tháng này'}
                            {timeframe === 'year' && 'Hiển thị tổng doanh thu 12 tháng'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full">
                {stats.chartData && stats.chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.chartData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#6B7280', fontSize: 12}}
                                dy={10}
                                interval={timeframe === 'month' ? 2 : 0}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#6B7280', fontSize: 12}}
                                tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}M` : value} 
                            />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, "Doanh thu"]}
                                labelStyle={{color: '#374151', fontWeight: 'bold'}}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Chưa có dữ liệu để hiển thị
                    </div>
                )}
            </div>
        </div>
      </div>
      {/* --- KẾT THÚC KHU VỰC IN --- */}
    </div>
  );
}