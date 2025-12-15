import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // State dữ liệu
  const [productData, setProductData] = useState({
    name: "",
    brandId: "",
    description: "",
    thumbnail: "",
  });

  const [variants, setVariants] = useState([]);

  // Load dữ liệu khi vào trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy danh sách hãng
        const brandsRes = await axiosClient.get("/brands");
        setBrands(brandsRes.data);
        

        // 2. Lấy thông tin sản phẩm cũ
        const productRes = await axiosClient.get(`/products/${id}`);
        const p = productRes.data;

        console.log("Dữ liệu API trả về:", p);

        // Đổ dữ liệu vào State
        setProductData({
          name: p.name,
          brandId: p.brandId,
          description: p.description,
          thumbnail: p.thumbnail || "",
        });

        // Map variants cho đúng cấu trúc form
        setVariants(
          p.variants.map((v) => ({
            id: v.id, // Quan trọng: Phải giữ lại ID để Backend biết là sửa
            color: v.color,
            ram: v.ram,
            rom: v.rom,
            price: v.price,
            stockQuantity: v.stockQuantity,
            imageUrl: v.imageUrl || "",
          }))
        );

        setLoading(false);
      } catch (error) {
        toast.error("Không tải được dữ liệu sản phẩm!");
        navigate("/admin/products");
      }
    };

    fetchData();
  }, [id, navigate]);

  // --- XỬ LÝ FORM ---
  const handleProductChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    // ID = 0 đánh dấu là mới thêm
    setVariants([
      ...variants,
      {
        id: 0,
        color: "",
        ram: "",
        rom: "",
        price: 0,
        stockQuantity: 0,
        imageUrl: "",
      },
    ]);
  };

  // --- SUBMIT UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: productData.name,
        description: productData.description,
        thumbnail: productData.thumbnail,
        
        // CÁCH 1: Lấy thẳng ID từ state (vì Backend đã trả về ID rồi)
        brandId: parseInt(productData.brandId), 
        
        variants: variants.map((v) => ({
          id: v.id,
          color: v.color,
          ram: v.ram,
          rom: v.rom,
          price: parseFloat(v.price),
          stockQuantity: parseInt(v.stockQuantity),
          imageUrl: v.imageUrl,
        })),
      };

      await axiosClient.put(`/products/${id}`, payload);

      toast.success("Cập nhật thành công!");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại!");
    }
  };

  if (loading) return <div className="p-10">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/products"
            className="text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Sửa sản phẩm: #{id}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-blue-700 shadow"
        >
          <Save size={20} /> <span>Lưu thay đổi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM CHA */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow h-fit">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">
            Thông tin chung
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tên sản phẩm
              </label>
              <input
                name="name"
                value={productData.name}
                onChange={handleProductChange}
                className="w-full border p-2 rounded focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Hãng (Chọn lại nếu cần)
              </label>
              <select
                name="brandId"
                value={productData.brandId}
                onChange={handleProductChange}
                className="w-full border p-2 rounded focus:outline-blue-500"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Link Ảnh đại diện
              </label>
              <input
                name="thumbnail"
                value={productData.thumbnail}
                onChange={handleProductChange}
                className="w-full border p-2 rounded focus:outline-blue-500"
              />

              {productData.thumbnail && productData.thumbnail.trim() !== "" ? (
                <img
                  src={productData.thumbnail}
                  alt="Preview"
                  className="mt-2 w-20 h-20 object-contain border rounded bg-white"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <p className="text-xs text-gray-400 mt-2">
                  Chưa có ảnh đại diện
                </p>
              )}
              {/* ----------------------------------------- */}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea
                name="description"
                rows="4"
                value={productData.description || ""}
                onChange={handleProductChange}
                className="w-full border p-2 rounded focus:outline-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        {/* FORM CON (BIẾN THỂ) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-gray-700">Các phiên bản</h3>
            <button
              onClick={addVariant}
              className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded font-bold hover:bg-green-200 flex items-center"
            >
              <Plus size={16} className="mr-1" /> Thêm dòng mới
            </button>
          </div>
          <div className="space-y-6">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded border relative"
              >
                {/* Ẩn nút xóa vì logic xóa phức tạp, làm sau */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500">
                      Màu sắc
                    </label>
                    <input
                      value={variant.color}
                      onChange={(e) =>
                        handleVariantChange(index, "color", e.target.value)
                      }
                      className="w-full border p-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">
                      RAM
                    </label>
                    <input
                      value={variant.ram}
                      onChange={(e) =>
                        handleVariantChange(index, "ram", e.target.value)
                      }
                      className="w-full border p-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">
                      ROM
                    </label>
                    <input
                      value={variant.rom}
                      onChange={(e) =>
                        handleVariantChange(index, "rom", e.target.value)
                      }
                      className="w-full border p-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">
                      Giá bán
                    </label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                      className="w-full border p-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">
                      Kho
                    </label>
                    <input
                      type="number"
                      value={variant.stockQuantity}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "stockQuantity",
                          e.target.value
                        )
                      }
                      className="w-full border p-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">
                      Ảnh
                    </label>
                    <input
                      value={variant.imageUrl}
                      onChange={(e) =>
                        handleVariantChange(index, "imageUrl", e.target.value)
                      }
                      className="w-full border p-1 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
