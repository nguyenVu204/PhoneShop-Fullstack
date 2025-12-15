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
    [Authorize] // Bắt buộc đăng nhập mới được Like
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/favorites (Lấy danh sách ID sản phẩm đã like để tô màu trái tim)
        [HttpGet("ids")]
        public async Task<ActionResult<IEnumerable<int>>> GetFavoriteIds()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var ids = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Select(f => f.ProductId)
                .ToListAsync();
            return Ok(ids);
        }

        // GET: api/favorites/list (Lấy danh sách đầy đủ sản phẩm để hiện trang Yêu thích)
        [HttpGet("list")]
        public async Task<ActionResult<IEnumerable<object>>> GetFavoritesList()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var products = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Product).ThenInclude(p => p.Brand)
                .Include(f => f.Product).ThenInclude(p => p.Variants) // Để lấy giá
                .Select(f => f.Product)
                .ToListAsync();

            // Map về dữ liệu gọn nhẹ cho Frontend
            var result = products.Select(p => new {
                p.Id,
                p.Name,
                p.Thumbnail,
                BrandName = p.Brand?.Name,
                MinPrice = p.Variants.Any() ? p.Variants.Min(v => v.Price) : 0
            });

            return Ok(result);
        }

        // POST: api/favorites/toggle/5 (Thả tim / Hủy tim)
        [HttpPost("toggle/{productId}")]
        public async Task<IActionResult> ToggleFavorite(int productId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var existing = await _context.Favorites.FindAsync(userId, productId);

            if (existing != null)
            {
                // Đã có -> Xóa (Unlike)
                _context.Favorites.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Đã bỏ yêu thích", IsLiked = false });
            }
            else
            {
                // Chưa có -> Thêm (Like)
                var favorite = new Favorite { UserId = userId, ProductId = productId };
                _context.Favorites.Add(favorite);
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Đã thêm vào yêu thích", IsLiked = true });
            }
        }
    }
}