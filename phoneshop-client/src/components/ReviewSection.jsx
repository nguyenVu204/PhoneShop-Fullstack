import { useEffect, useState } from 'react';
import { Star, User, Send } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import useAuthStore from '../stores/useAuthStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function ReviewSection({ productId }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5); // Mặc định 5 sao
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0); // Hiệu ứng hover sao

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
        const res = await axiosClient.get(`/reviews/product/${productId}`);
        setReviews(res.data);
    } catch (error) {
        console.error("Lỗi tải đánh giá");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Vui lòng nhập nội dung đánh giá!");

    try {
        const payload = {
            productId: parseInt(productId),
            rating: rating,
            comment: comment
        };
        const res = await axiosClient.post('/reviews', payload);
        
        // Thêm review mới vào đầu danh sách ngay lập tức
        setReviews([res.data, ...reviews]); 
        setComment('');
        setRating(5);
        toast.success("Cảm ơn đánh giá của bạn!");
    } catch (error) {
        toast.error("Gửi đánh giá thất bại (Có thể cần đăng nhập lại)");
    }
  };

  // Tính trung bình sao
  const averageRating = reviews.length > 0 
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
      : 0;

  return (
    <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
         Đánh giá sản phẩm <span className="text-sm font-normal text-gray-500">({reviews.length} đánh giá)</span>
      </h2>

      {/* --- PHẦN TỔNG QUAN --- */}
      <div className="flex flex-col md:flex-row gap-8 mb-10 border-b border-gray-100 pb-8">
          <div className="text-center md:text-left">
              <div className="text-5xl font-black text-gray-800 mb-2">{averageRating}/5</div>
              <div className="flex justify-center md:justify-start gap-1 mb-2">
                 {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        size={20} 
                        className={star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                    />
                 ))}
              </div>
              <p className="text-sm text-gray-500">Dựa trên {reviews.length} nhận xét</p>
          </div>

          {/* --- FORM VIẾT ĐÁNH GIÁ --- */}
          <div className="flex-1 bg-gray-50 p-6 rounded-xl">
             {user ? (
                 <form onSubmit={handleSubmit}>
                    <p className="font-bold text-gray-700 mb-3">Viết đánh giá của bạn</p>
                    
                    {/* Chọn Sao */}
                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star 
                                    size={28} 
                                    className={`transition-colors ${star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                                />
                            </button>
                        ))}
                        <span className="ml-2 text-sm font-bold text-yellow-600 mt-1">
                            {hoverRating || rating} Sao
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2">
                            <Send size={18}/> Gửi
                        </button>
                    </div>
                 </form>
             ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                     <p className="text-gray-500">Bạn cần đăng nhập để viết đánh giá.</p>
                     <Link to="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập ngay</Link>
                 </div>
             )}
          </div>
      </div>

      {/* --- DANH SÁCH REVIEW --- */}
      <div className="space-y-6">
          {reviews.length === 0 && (
              <p className="text-center text-gray-400 py-4">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          )}

          {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start gap-4">
                      {/* Avatar giả lập từ tên */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {review.userFullName?.charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                              <h4 className="font-bold text-gray-800">{review.userFullName}</h4>
                              <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          
                          <div className="flex gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    size={14} 
                                    className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                                  />
                              ))}
                          </div>
                          
                          <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg inline-block">
                              {review.comment}
                          </p>
                      </div>
                  </div>
              </div>
          ))}
      </div>

    </div>
  );
}