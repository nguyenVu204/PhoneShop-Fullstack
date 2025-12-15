import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

export default function ProductCreate() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);

  // State 1: Thông tin chung sản phẩm (Cha)
  const [productData, setProductData] = useState({
    name: '',
    brandId: '', // Sẽ lưu ID hãng
    description: '',
    thumbnail: ''
  });

  // State 2: Danh sách biến thể (Con) - Mặc định có 1 dòng trắng
  const [variants, setVariants] = useState([
    { color: '', ram: '', rom: '', price: 0, stockQuantity: 0, imageUrl: '' }
  ]);

  // Load danh sách Hãng để đổ vào thẻ <select>
  useEffect(() => {
    axiosClient.get('/brands')
      .then(res => setBrands(res.data))
      .catch(err => console.error(err));
  }, []);

  // --- XỬ LÝ FORM CHA ---
  const handleProductChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  // --- XỬ LÝ FORM CON (BIẾN THỂ) ---
  
  // 1. Thay đổi dữ liệu của 1 dòng biến thể cụ thể
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  // 2. Thêm dòng mới
  const addVariant = () => {
    setVariants([...variants, { color: '', ram: '', rom: '', price: 0, stockQuantity: 0, imageUrl: '' }]);
  };

  // 3. Xóa dòng
  const removeVariant = (index) => {
    if (variants.length === 1) {
        toast.error("Phải có ít nhất 1 phiên bản!");
        return;
    }
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate cơ bản
    if (!productData.name || !productData.brandId) {
        toast.error("Vui lòng nhập tên và chọn hãng!");
        return;
    }

    try {
      // Chuẩn bị cục JSON đúng cấu trúc Backend yêu cầu (CreateProductDto)
      const payload = {
        name: productData.name,
        description: productData.description,
        thumbnail: productData.thumbnail,
        brandId: parseInt(productData.brandId), // Chuyển string sang int
        variants: variants.map(v => ({
            ...v,
            price: parseFloat(v.price), // Đảm bảo là số
            stockQuantity: parseInt(v.stockQuantity)
        }))
      };

      await axiosClient.post('/products', payload);
      
      toast.success("Thêm sản phẩm mới thành công!");
      navigate('/admin/products'); // Quay về danh sách
    } catch (error) {
      console.error(error);
      toast.error("Thêm thất bại! Kiểm tra lại dữ liệu.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
            <Link to="/admin/products" className="text-gray-500 hover:text-gray-800">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Thêm điện thoại mới</h1>
        </div>
        <button 
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-blue-700 shadow"
        >
            <Save size={20} />
            <span>Lưu sản phẩm</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN CHUNG */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Thông tin chung</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
                        <input name="name" type="text" className="w-full border p-2 rounded focus:outline-blue-500" onChange={handleProductChange} placeholder="Ví dụ: iPhone 16" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Hãng sản xuất</label>
                        <select name="brandId" className="w-full border p-2 rounded focus:outline-blue-500" onChange={handleProductChange} defaultValue="">
                            <option value="" disabled>-- Chọn hãng --</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Link Ảnh đại diện</label>
                        <input name="thumbnail" type="text" className="w-full border p-2 rounded focus:outline-blue-500" onChange={handleProductChange} placeholder="https://..." />
                        {productData.thumbnail && <img src={productData.thumbnail} alt="Preview" className="mt-2 w-20 h-20 object-contain border rounded"/>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea name="description" rows="4" className="w-full border p-2 rounded focus:outline-blue-500" onChange={handleProductChange}></textarea>
                    </div>
                </div>
            </div>
        </div>

        {/* CỘT PHẢI: DANH SÁCH BIẾN THỂ */}
        <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-gray-700">Các phiên bản (Màu sắc / Bộ nhớ)</h3>
                    <button onClick={addVariant} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded font-bold hover:bg-green-200 flex items-center">
                        <Plus size={16} className="mr-1"/> Thêm dòng
                    </button>
                </div>

                <div className="space-y-6">
                    {variants.map((variant, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded border relative group">
                            <button 
                                onClick={() => removeVariant(index)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                                title="Xóa dòng này"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Màu sắc</label>
                                    <input type="text" className="w-full border p-1 rounded text-sm" placeholder="Vàng, Đỏ..." 
                                        value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">RAM</label>
                                    <input type="text" className="w-full border p-1 rounded text-sm" placeholder="8GB" 
                                        value={variant.ram} onChange={e => handleVariantChange(index, 'ram', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">ROM</label>
                                    <input type="text" className="w-full border p-1 rounded text-sm" placeholder="128GB" 
                                        value={variant.rom} onChange={e => handleVariantChange(index, 'rom', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Giá bán (VNĐ)</label>
                                    <input type="number" className="w-full border p-1 rounded text-sm" 
                                        value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Số lượng kho</label>
                                    <input type="number" className="w-full border p-1 rounded text-sm" 
                                        value={variant.stockQuantity} onChange={e => handleVariantChange(index, 'stockQuantity', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Link Ảnh màu này</label>
                                    <input type="text" className="w-full border p-1 rounded text-sm" placeholder="https://..."
                                        value={variant.imageUrl} onChange={e => handleVariantChange(index, 'imageUrl', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}