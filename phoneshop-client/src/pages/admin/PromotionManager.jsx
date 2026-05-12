import { useEffect, useState } from 'react';
import { Search, Gift, Save, Ban, Tag, Package, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

export default function PromotionManager() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All' hoặc 'Active'

  useEffect(() => {
    fetchVariants();
  }, [filterType]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const url = filterType === 'Active' ? '/products/variants-promo?onlyDiscounted=true' : '/products/variants-promo';
      const res = await axiosClient.get(url);
      
      // Khởi tạo thêm trường inputDiscount để quản lý state nhập liệu local
      const mappedData = res.data.map(v => ({
          ...v,
          inputDiscount: v.discountPrice || ''
      }));
      setVariants(mappedData);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // Lọc theo tìm kiếm text
  const filteredData = variants.filter(v => 
      v.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (index, value) => {
      const newData = [...variants];
      newData[index].inputDiscount = value;
      setVariants(newData);
  };

  // --- HÀM CẬP NHẬT GIÁ KHUYẾN MÃI (BẬT) ---
  const handleSaveDiscount = async (index, variant) => {
      const newDiscount = parseFloat(variant.inputDiscount);
      if (!newDiscount || newDiscount <= 0) {
          return toast.error("Vui lòng nhập giá khuyến mãi hợp lệ!");
      }
      if (newDiscount >= variant.price) {
          return toast.error("Giá khuyến mãi phải nhỏ hơn giá gốc!");
      }

      try {
          await axiosClient.put(`/products/variants/${variant.id}/discount`, { discountPrice: newDiscount });
          toast.success(`Đã áp dụng giảm giá cho ${variant.productName}!`);
          
          // Cập nhật lại UI local
          const newData = [...variants];
          newData[index].discountPrice = newDiscount;
          setVariants(newData);
      } catch (error) {
          toast.error(error.response?.data || "Lỗi cập nhật!");
      }
  };

  // --- HÀM TẮT KHUYẾN MÃI (TẮT) ---
  const handleRemoveDiscount = async (index, variant) => {
      if (!confirm(`Bạn muốn TẮT khuyến mãi cho sản phẩm này?`)) return;
      try {
          await axiosClient.put(`/products/variants/${variant.id}/discount`, { discountPrice: null });
          toast.success(`Đã tắt khuyến mãi!`);
          
          // Cập nhật lại UI local
          const newData = [...variants];
          newData[index].discountPrice = null;
          newData[index].inputDiscount = '';
          
          // Nếu đang ở tab "Đang Sale" thì xóa nó khỏi giao diện
          if (filterType === 'Active') {
              setVariants(newData.filter((_, i) => i !== index));
          } else {
              setVariants(newData);
          }
      } catch (error) {
          toast.error("Lỗi cập nhật!");
      }
  };

  const activeCount = variants.filter(v => v.discountPrice > 0).length;

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý Khuyến mãi</h1>
            <p className="text-slate-500 text-sm">Cài đặt giá Flash Sale, Giảm giá siêu tốc cho từng phiên bản.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div onClick={() => setFilterType('All')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterType === 'All' ? 'bg-blue-600 text-white shadow-lg border-blue-600' : 'bg-white hover:border-blue-300'}`}>
              <p className={`text-sm font-bold mb-1 ${filterType === 'All' ? 'text-blue-100' : 'text-gray-500'}`}>Tổng số phiên bản</p>
              <p className="text-3xl font-black">{filterType === 'All' ? variants.length : '...'}</p>
          </div>
          <div onClick={() => setFilterType('Active')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterType === 'Active' ? 'bg-red-500 text-white shadow-lg border-red-500' : 'bg-white hover:border-red-300'}`}>
              <p className={`text-sm font-bold mb-1 flex items-center gap-1 ${filterType === 'Active' ? 'text-red-100' : 'text-red-500'}`}><Percent size={14}/> Đang chạy Sale</p>
              <p className="text-3xl font-black">{activeCount}</p>
          </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center">
            <div className="relative w-full md:w-80">
                <input 
                    type="text" placeholder="Tìm tên máy, màu sắc..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-50 text-gray-500">
                        <th className="p-4 font-semibold uppercase w-16">Ảnh</th>
                        <th className="p-4 font-semibold uppercase">Sản phẩm</th>
                        <th className="p-4 font-semibold uppercase text-right">Giá gốc</th>
                        <th className="p-4 font-semibold uppercase w-48 text-center">Thiết lập Giá KM</th>
                        <th className="p-4 font-semibold uppercase text-center w-28">Trạng thái</th>
                        <th className="p-4 font-semibold uppercase text-right w-40">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="6" className="p-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                    ) : filteredData.length === 0 ? (
                        <tr><td colSpan="6" className="p-10 text-center text-gray-400">Không tìm thấy dữ liệu.</td></tr>
                    ) : filteredData.map((item, index) => (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-4">
                                <div className="w-12 h-12 rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-contain"/> : <Package size={20} className="text-gray-300"/>}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="font-bold text-gray-800">{item.productName}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    <span className="font-bold text-blue-600">{item.brandName}</span> | {item.color} - {item.rom}
                                </div>
                            </td>
                            <td className="p-4 text-right font-medium text-gray-500">
                                <span className={item.discountPrice ? "line-through" : ""}>{item.price.toLocaleString()} ₫</span>
                            </td>
                            
                            {/* Ô nhập Giá KM */}
                            <td className="p-4">
                                <input 
                                    type="number" 
                                    className={`w-full border p-2 rounded-lg text-sm text-right focus:outline-blue-500 font-bold ${item.discountPrice ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50'}`}
                                    placeholder="VD: 15000000"
                                    value={item.inputDiscount}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                />
                            </td>

                            <td className="p-4 text-center">
                                {item.discountPrice ? (
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                                        Đang Sale
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                        Không
                                    </span>
                                )}
                            </td>

                            {/* Nút hành động */}
                            <td className="p-4">
                                <div className="flex justify-end gap-2">
                                    {item.discountPrice ? (
                                        <button 
                                            onClick={() => handleRemoveDiscount(index, item)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition" title="Tắt khuyến mãi"
                                        >
                                            <Ban size={16}/>
                                        </button>
                                    ) : null}
                                    
                                    <button 
                                        onClick={() => handleSaveDiscount(index, item)}
                                        disabled={item.inputDiscount == item.discountPrice}
                                        className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <Save size={14}/> {item.discountPrice ? "Sửa KM" : "Bật KM"}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}