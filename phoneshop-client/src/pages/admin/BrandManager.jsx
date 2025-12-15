import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Search, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

export default function BrandManager() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null); // null = Thêm mới, object = Đang sửa
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    try {
      const res = await axiosClient.get('/brands');
      setBrands(res.data);
      setLoading(false);
    } catch (error) {
      toast.error("Lỗi tải danh sách hãng!");
      setLoading(false);
    }
  };

  // --- XỬ LÝ LỌC TÌM KIẾM ---
  const filteredBrands = brands.filter(b => 
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- XỬ LÝ MODAL ---
  const openAddModal = () => {
      setEditingBrand(null);
      setFormData({ name: '' });
      setIsModalOpen(true);
  };

  const openEditModal = (brand) => {
      setEditingBrand(brand);
      setFormData({ name: brand.name });
      setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // --- XỬ LÝ API THÊM / SỬA ---
  const handleSave = async (e) => {
      e.preventDefault();
      if (!formData.name.trim()) return toast.error("Tên hãng không được để trống!");

      try {
          if (editingBrand) {
              // Sửa
              await axiosClient.put(`/brands/${editingBrand.id}`, { 
                  id: editingBrand.id, 
                  name: formData.name 
              });
              toast.success("Cập nhật thành công!");
              
              // Update state trực tiếp đỡ gọi lại API
              setBrands(brands.map(b => b.id === editingBrand.id ? { ...b, name: formData.name } : b));
          } else {
              // Thêm mới
              const res = await axiosClient.post('/brands', { name: formData.name });
              toast.success("Thêm mới thành công!");
              setBrands([...brands, res.data]);
          }
          closeModal();
      } catch (error) {
          console.error(error);
          toast.error("Có lỗi xảy ra!");
      }
  };

  // --- XỬ LÝ XÓA ---
  const handleDelete = async (id) => {
      if (!confirm("Bạn có chắc chắn muốn xóa hãng này?")) return;
      try {
          await axiosClient.delete(`/brands/${id}`);
          toast.success("Đã xóa!");
          setBrands(brands.filter(b => b.id !== id));
      } catch (error) {
          // Backend trả về lỗi nếu hãng đang có sản phẩm (BadRequest 400)
          if(error.response && error.response.status === 400) {
              toast.error(error.response.data.Message || "Không thể xóa hãng đang có sản phẩm!");
          } else {
              toast.error("Xóa thất bại!");
          }
      }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>;

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Quản lý Hãng</h1>
           <p className="text-slate-500 text-sm">Danh sách thương hiệu điện thoại</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    placeholder="Tìm tên hãng..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            </div>

            <button 
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
                <Plus size={18} />
                <span>Thêm Hãng</span>
            </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">ID</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tên Hãng</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                    <td className="p-4 text-gray-500 font-mono text-sm">#{brand.id}</td>
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Tag size={16}/>
                            </div>
                            <span className="font-bold text-gray-800">{brand.name}</span>
                        </div>
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => openEditModal(brand)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Sửa tên"
                            >
                                <Edit size={18} />
                            </button>
                            <button 
                                onClick={() => handleDelete(brand.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Xóa hãng"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            
            {filteredBrands.length === 0 && (
                <div className="p-8 text-center text-gray-500">Không tìm thấy hãng nào.</div>
            )}
        </div>
      </div>

      {/* --- MODAL THÊM / SỬA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-lg text-gray-800">
                        {editingBrand ? "Sửa tên hãng" : "Thêm hãng mới"}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition">
                        <X size={20}/>
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên hãng</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            placeholder="Ví dụ: Xiaomi, Oppo..."
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={closeModal}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition"
                        >
                            {editingBrand ? "Lưu thay đổi" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}