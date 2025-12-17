using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using System.Security.Claims;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/reviews/product/5 (Lấy danh sách review theo sản phẩm)
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetProductReviews(int productId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .Include(r => r.User) // Join bảng User để lấy tên
                .OrderByDescending(r => r.CreatedAt) // Mới nhất lên đầu
                .Select(r => new {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    UserFullName = r.User.FullName
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // POST: api/reviews
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto request)
        {
            // 1. Lấy UserId từ Token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 2. Validate dữ liệu
            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest("Số sao phải từ 1 đến 5");

            // 3. Map từ DTO sang Entity (Model Database)
            var review = new Review
            {
                ProductId = request.ProductId,
                Rating = request.Rating,
                Comment = request.Comment,
                UserId = userId,      
                CreatedAt = DateTime.Now
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // 4. Lấy thông tin User để trả về cho Frontend hiển thị ngay lập tức
            var user = await _context.Users.FindAsync(userId);

            return Ok(new
            {
                review.Id,
                review.Rating,
                review.Comment,
                review.CreatedAt,
                UserFullName = user?.FullName
            });
        }
    }

    public class CreateReviewDto
    {
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}