using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Services;
using System.Security.Claims;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // GET: api/reviews/product/5 (Lấy danh sách review theo sản phẩm)
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetProductReviews(int productId)
        {
            return Ok(await _reviewService.GetByProductAsync(productId));
        }

        // POST: api/reviews
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
        {
            // 1. Lấy UserId từ Token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var review = await _reviewService.CreateAsync(request, userId);
            return review is null ? BadRequest("Số sao phải từ 1 đến 5") : Ok(review);
        }
    }
}