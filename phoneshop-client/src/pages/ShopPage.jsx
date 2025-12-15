import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom"; // Import useSearchParams
import { Search, ChevronLeft, ChevronRight, ShoppingCart, Heart, Filter, ArrowUpDown } from "lucide-react";
import axiosClient from "../api/axiosClient";
import useFavoriteStore from '../stores/useFavoriteStore';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favoriteIds, toggleFavorite } = useFavoriteStore();
  
  // Lấy tham số từ URL (ví dụ: /shop?search=iphone)
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchTerm = searchParams.get('search') || "";

  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm); 
  const [page, setPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1); 
  const [selectedBrand, setSelectedBrand] = useState(null); 
  const [priceRange, setPriceRange] = useState("all"); 
  const [sortOption, setSortOption] = useState("newest");
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearchTerm);

  // Load danh sách hãng
  useEffect(() => {
      axiosClient.get('/brands').then(res => setBrands(res.data)).catch(console.error);
  }, []);

  // Đồng bộ URL Search với State khi URL thay đổi (từ Header)
  useEffect(() => {
      setSearchTerm(urlSearchTerm);
      setDebouncedSearch(urlSearchTerm);
  }, [urlSearchTerm]);

  // Debounce Search Input tại trang này
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); 
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch API
  useEffect(() => {
    setLoading(true);
    let minPrice = "";
    let maxPrice = "";
    
    if (priceRange === 'under5') { maxPrice = 5000000; }
    else if (priceRange === '5to10') { minPrice = 5000000; maxPrice = 10000000; }
    else if (priceRange === '10to20') { minPrice = 10000000; maxPrice = 20000000; }
    else if (priceRange === 'over20') { minPrice = 20000000; }

    const params = new URLSearchParams({
        search: debouncedSearch,
        page: page,
        limit: 6, 
        sort: sortOption
    });

    if (selectedBrand) params.append('brandId', selectedBrand);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    axiosClient.get(`/products?${params.toString()}`)
      .then((res) => {
        setProducts(res.data.items);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [debouncedSearch, page, selectedBrand, priceRange, sortOption]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb nhỏ */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link> / <span className="text-gray-800 font-bold">Cửa hàng</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Tất cả sản phẩm</h1>

        {/* SEARCH & SORT */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
                <input
                    type="text"
                    placeholder="Tìm tên máy..."
                    className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-blue-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>

            <div className="relative">
                <select 
                    className="appearance-none pl-10 pr-8 py-2 bg-white border rounded-full shadow-sm focus:outline-blue-500 cursor-pointer text-sm font-medium"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá tăng dần</option>
                    <option value="price_desc">Giá giảm dần</option>
                    <option value="name_asc">Tên A-Z</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-2.5 text-gray-500" size={18}/>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* --- SIDEBAR BỘ LỌC --- */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Filter size={18}/> Thương hiệu</h3>
                  <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                          <input type="radio" name="brand" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={selectedBrand === null} onChange={() => { setSelectedBrand(null); setPage(1); }} />
                          <span className="text-gray-700 font-medium">Tất cả</span>
                      </label>
                      {brands.map(brand => (
                          <label key={brand.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                              <input type="radio" name="brand" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={selectedBrand === brand.id} onChange={() => { setSelectedBrand(brand.id); setPage(1); }} />
                              <span className="text-gray-700">{brand.name}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4">Mức giá</h3>
                  <div className="space-y-2">
                      {[
                          { val: 'all', label: 'Tất cả mức giá' },
                          { val: 'under5', label: 'Dưới 5 triệu' },
                          { val: '5to10', label: 'Từ 5 - 10 triệu' },
                          { val: '10to20', label: 'Từ 10 - 20 triệu' },
                          { val: 'over20', label: 'Trên 20 triệu' },
                      ].map((range) => (
                          <label key={range.val} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                              <input type="radio" name="price" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={priceRange === range.val} onChange={() => { setPriceRange(range.val); setPage(1); }} />
                              <span className="text-gray-700">{range.label}</span>
                          </label>
                      ))}
                  </div>
              </div>
          </div>

          {/* --- DANH SÁCH SẢN PHẨM --- */}
          <div className="lg:col-span-3">
              {loading && <div className="text-center py-20 text-gray-400">Đang tải sản phẩm...</div>}

              {!loading && products.length === 0 && (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl">
                      <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
                      <button onClick={() => { setSelectedBrand(null); setPriceRange('all'); setSearchTerm(''); }} className="mt-4 text-blue-600 font-bold hover:underline">Xóa bộ lọc</button>
                  </div>
              )}

              {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <Link to={`/product/${product.id}`} key={product.id} className="group">
                    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col hover:-translate-y-1 relative">
                        <button 
                            onClick={(e) => { e.preventDefault(); toggleFavorite(product.id); }}
                            className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition"
                        >
                            <Heart size={20} className={`transition-colors duration-300 ${favoriteIds.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
                        </button>

                        <div className="relative h-52 mb-4 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                            {product.thumbnail ? (
                                <img src={product.thumbnail} alt={product.name} className="h-40 object-contain group-hover:scale-110 transition duration-500 mix-blend-multiply"/>
                            ) : <span className="text-gray-400 text-xs">No image</span>}
                        </div>

                        <div className="flex-1 flex flex-col">
                            <p className="text-xs text-blue-500 font-bold uppercase mb-1">{product.brandName}</p>
                            <h3 className="font-bold text-gray-800 text-lg mb-1 leading-snug group-hover:text-blue-600 transition line-clamp-2">{product.name}</h3>
                        </div>

                        <div className="mt-4 flex items-end justify-between">
                            <div>
                                <span className="text-xs text-gray-400 line-through">Gốc</span>
                                <div className="text-red-600 font-bold text-xl">{product.minPrice.toLocaleString("vi-VN")} ₫</div>
                            </div>
                            <button className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition">
                                <ShoppingCart size={18} />
                            </button>
                        </div>
                    </div>
                    </Link>
                ))}
                </div>
              )}

              {/* Phân trang */}
              {!loading && totalPages > 1 && (
                <div className="flex justify-center mt-10 space-x-2">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={20} /></button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)} className={`px-4 py-2 border rounded font-bold ${page === i + 1 ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100 text-gray-700"}`}>{i + 1}</button>
                    ))}
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={20} /></button>
                </div>
              )}
          </div>
      </div>
    </div>
  );
}