import { useEffect, useState } from "react";
import { User, Search, Trash2, Lock, Unlock, ChevronLeft, ChevronRight, Mail, Phone, Shield, Edit, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Phân trang & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // --- STATE CHO MODAL EDIT ---
  const [selectedUser, setSelectedUser] = useState(null); // User đang được sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", phoneNumber: "", role: "Customer" });

  // 1. Debounce Search: Chờ 500ms sau khi ngừng gõ mới gọi API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset về trang 1 khi tìm kiếm mới
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Gọi API lấy danh sách User
  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Gọi API với tham số search, page, limit
      const res = await axiosClient.get(`/users?search=${debouncedSearch}&page=${page}&limit=10`);
      
      // Backend trả về: { items, totalPages, totalItems, ... }
      setUsers(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalItems);
    } catch (error) {
      toast.error("Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý Khóa / Mở khóa tài khoản
  const handleToggleLock = async (userId, isCurrentlyLocked) => {
     const action = isCurrentlyLocked ? "MỞ KHÓA" : "KHÓA";
     if(!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
     
     try {
         // Gọi API: POST /api/users/{id}/lock
         await axiosClient.post(`/users/${userId}/lock`);
         
         toast.success(`Đã ${action.toLowerCase()} thành công!`);
         fetchUsers(); // Load lại danh sách để cập nhật trạng thái
     } catch(error) {
         toast.error("Lỗi cập nhật trạng thái");
     }
  };

  // 4. Xử lý Xóa người dùng
  const handleDelete = async (userId) => {
      if(!confirm("CẢNH BÁO: Xóa người dùng sẽ xóa toàn bộ dữ liệu liên quan (Đơn hàng, Đánh giá...). Bạn có chắc chắn không?")) return;
      
      try {
          await axiosClient.delete(`/users/${userId}`);
          toast.success("Đã xóa người dùng");
          fetchUsers(); // Load lại danh sách
      } catch (error) {
          toast.error("Không thể xóa người dùng này (Có thể do lỗi server)");
      }
  }

  // Helper check xem user có bị khóa không (Dựa vào LockoutEnd)
  const isLocked = (lockoutEnd) => {
      return lockoutEnd && new Date(lockoutEnd) > new Date();
  };

  // --- LOGIC MỞ MODAL SỬA ---
  const openEditModal = (user) => {
      setSelectedUser(user);
      // Lấy role đầu tiên, nếu không có thì mặc định Customer
      const currentRole = user.roles && user.roles.length > 0 ? user.roles[0] : "Customer";
      
      setEditForm({
          fullName: user.fullName || "",
          phoneNumber: user.phoneNumber || "",
          role: currentRole
      });
      setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
      e.preventDefault();
      try {
          // 1. Cập nhật thông tin cơ bản
          await axiosClient.put(`/users/${selectedUser.id}`, {
              fullName: editForm.fullName,
              phoneNumber: editForm.phoneNumber
          });

          // 2. Cập nhật Quyền (Gọi API assign-role)
          // Lưu ý: Backend assign-role của bạn nhận { userId, roleName }
          await axiosClient.post(`/users/assign-role`, {
              userId: selectedUser.id,
              roleName: editForm.role
          });

          toast.success("Cập nhật thành công!");
          setIsModalOpen(false);
          fetchUsers(); // Load lại bảng
      } catch (error) {
          toast.error("Cập nhật thất bại");
      }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Người dùng</h1>
          <p className="text-slate-500 text-sm">Tổng số: <span className="font-bold text-blue-600">{totalItems}</span> tài khoản</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm tên, email, sđt..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Người dùng</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Vai trò</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (<tr><td colSpan="4" className="text-center py-20 text-gray-400">Đang tải...</td></tr>) : 
               users.length === 0 ? (<tr><td colSpan="4" className="text-center py-20 text-gray-400">Trống.</td></tr>) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition">
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={20}/>}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{user.fullName || "---"}</p>
                                <div className="flex flex-col text-xs text-gray-500 mt-0.5">
                                    <span className="flex items-center gap-1"><Mail size={10}/> {user.email}</span>
                                    <span className="flex items-center gap-1"><Phone size={10}/> {user.phoneNumber || "---"}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="p-4">
                        {user.roles && user.roles.includes("Admin") ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                <Shield size={12}/> Admin
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                <User size={12}/> Khách hàng
                            </span>
                        )}
                    </td>
                    <td className="p-4">
                        {isLocked(user.lockoutEnd) ? (
                            <span className="text-red-600 font-bold text-xs flex items-center gap-1"><Lock size={12}/> Đang khóa</span>
                        ) : (
                            <span className="text-green-600 font-bold text-xs flex items-center gap-1"><Shield size={12}/> Hoạt động</span>
                        )}
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            {/* Nút Sửa */}
                            <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition" title="Sửa thông tin">
                                <Edit size={18}/>
                            </button>

                            {/* Nút Khóa */}
                            <button onClick={() => handleToggleLock(user.id, isLocked(user.lockoutEnd))} className={`p-2 rounded-lg transition ${isLocked(user.lockoutEnd) ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-orange-600 bg-orange-50 hover:bg-orange-100'}`}>
                                {isLocked(user.lockoutEnd) ? <Unlock size={18}/> : <Lock size={18}/>}
                            </button>

                            {/* Nút Xóa */}
                            <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER: PHÂN TRANG */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-2 bg-gray-50/30">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 border rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 transition"
                >
                    <ChevronLeft size={20} className="text-gray-600"/>
                </button>

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
                    className="p-2 border rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 transition"
                >
                    <ChevronRight size={20} className="text-gray-600"/>
                </button>
            </div>
        )}
      </div>
      {/* --- MODAL CHỈNH SỬA USER --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">Cập nhật người dùng</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Không thể sửa)</label>
                        <input type="text" value={selectedUser?.email} disabled className="w-full px-3 py-2 bg-gray-100 border rounded-lg text-gray-500 text-sm cursor-not-allowed"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input type="text" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phân quyền</label>
                        <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                            <option value="Customer">Customer (Khách hàng)</option>
                            <option value="Admin">Admin (Quản trị viên)</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">*Admin có toàn quyền truy cập hệ thống.</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition">Hủy</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                            <Save size={18}/> Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}