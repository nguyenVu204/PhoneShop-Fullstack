using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneShop.Application.Interfaces.Services;
using System.Security.Claims;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc đăng nhập mới được Like
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoriteService _favoriteService;

        public FavoritesController(IFavoriteService favoriteService)
        {
            _favoriteService = favoriteService;
        }

        // GET: api/favorites (Lấy danh sách ID sản phẩm đã like để tô màu trái tim)
        [HttpGet("ids")]
        public async Task<ActionResult<IEnumerable<int>>> GetFavoriteIds()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Ok(await _favoriteService.GetIdsAsync(userId!));
        }

        // GET: api/favorites/list (Lấy danh sách đầy đủ sản phẩm để hiện trang Yêu thích)
        [HttpGet("list")]
        public async Task<ActionResult<IEnumerable<object>>> GetFavoritesList()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Ok(await _favoriteService.GetProductsAsync(userId!));
        }

        // POST: api/favorites/toggle/5 (Thả tim / Hủy tim)
        [HttpPost("toggle/{productId}")]
        public async Task<IActionResult> ToggleFavorite(int productId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var isLiked = await _favoriteService.ToggleAsync(userId!, productId);
            return Ok(new
            {
                Message = isLiked ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích",
                IsLiked = isLiked
            });
        }
    }
}