import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Edit, Search, ChevronLeft, ChevronRight, Filter, FileDown, FileUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileInputRef = useRef(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchTerm);
        setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch logic
  useEffect(() => { fetchProducts(); }, [debouncedSearch, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/products?search=${debouncedSearch}&page=${page}&limit=10`);
      setProducts(res.data.items);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (error) {
      toast.error("Lỗi tải danh sách!");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      toast.success("Đã xóa!");
      fetchProducts();
    } catch (error) { toast.error("Xóa thất bại!"); }
  };

  // --- XỬ LÝ XUẤT EXCEL ---
  const handleExport = async () => {
      try {
          const response = await axiosClient.get('/products/export', {
              responseType: 'blob', // Quan trọng: Báo cho axios biết đây là file
          });
          
          // Tạo link ảo để tải về
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Products_${new Date().toISOString().split('T')[0]}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          toast.success("Đã tải xuống file Excel!");
      } catch (error) {
          toast.error("Lỗi xuất file!");
      }
  };

  // --- XỬ LÝ NHẬP EXCEL ---
  const handleImportClick = () => {
      fileInputRef.current.click(); // Kích hoạt thẻ input file ẩn
  };

  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const toastId = toast.loading("Đang nhập dữ liệu, vui lòng đợi...");

      try {
          const res = await axiosClient.post('/products/import', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.dismiss(toastId);
          toast.success(res.data.Message);
          fetchProducts(); // Load lại bảng
      } catch (error) {
          toast.dismiss(toastId);
          toast.error("Lỗi nhập file! Kiểm tra định dạng Excel.");
      } finally {
          e.target.value = null; // Reset input để chọn lại file cũ được
      }
  };

  return (
    <div>
      {/* HEADER: Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Sản phẩm</h1>
           <p className="text-slate-500 text-sm">Quản lý danh sách điện thoại</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">

          {/* Input file ẩn dùng cho Import */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".xlsx, .xls"
            />

            {/* Nút Import */}
            <button 
                onClick={handleImportClick}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition"
                title="Nhập từ Excel"
            >
                <FileUp size={18} />
                <span className="hidden md:inline">Nhập Excel</span>
            </button>

            {/* Nút Export */}
            <button 
                onClick={handleExport}
                className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition"
                title="Xuất ra Excel"
            >
                <FileDown size={18} />
                <span className="hidden md:inline">Xuất Excel</span>
            </button>
            
            
            {/* Search Input */}
            <div className="relative flex-1 md:w-72 group">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
            </div>

            {/* Add Button */}
            <Link 
            to="/admin/products/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
                <Plus size={18} />
                <span className="hidden md:inline">Thêm mới</span>
            </Link>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
        ) : (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-16">ID</th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">Ảnh</th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tên sản phẩm</th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Hãng</th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Giá sàn</th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                        <tr key={product.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                            <td className="p-4 text-gray-500 text-sm">#{product.id}</td>
                            <td className="p-4">
                                <div className="w-12 h-12 rounded-lg border border-gray-100 bg-white p-1 flex items-center justify-center">
                                    {product.thumbnail ? (
                                        <img src={product.thumbnail} alt="" className="max-w-full max-h-full object-contain"/>
                                    ) : (
                                        <div className="text-[10px] text-gray-300">No Img</div>
                                    )}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="font-semibold text-gray-800">{product.name}</span>
                            </td>
                            <td className="p-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {product.brandName}
                                </span>
                            </td>
                            <td className="p-4 font-medium text-slate-700">
                                {product.minPrice.toLocaleString('vi-VN')} ₫
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Link to={`/admin/products/edit/${product.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                        <Edit size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>

                {products.length === 0 && (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <Filter size={48} className="text-gray-200 mb-4"/>
                        <p>Không tìm thấy sản phẩm nào.</p>
                    </div>
                )}
                
                {/* FOOTER: Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-end items-center gap-2">
                         <button 
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                            <ChevronLeft size={16}/>
                        </button>
                        <span className="text-sm font-medium text-gray-600 px-2">
                            Trang {page} / {totalPages}
                        </span>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                            <ChevronRight size={16}/>
                        </button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}