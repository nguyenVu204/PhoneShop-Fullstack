using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneShop.API.Dtos;
using System.Security.Claims;
using PhoneShop.Application.Interfaces.Services;
using PhoneShop.Application.DTOs;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly INewsQueryService _newsQueryService;
        private readonly INewsAdminService _newsAdminService;
        private readonly INewsCommentService _newsCommentService;

        public NewsController(INewsQueryService newsQueryService, INewsAdminService newsAdminService, INewsCommentService newsCommentService)
        {
            _newsQueryService = newsQueryService;
            _newsAdminService = newsAdminService;
            _newsCommentService = newsCommentService;
        }

        // ==========================================
        // 1. DÀNH CHO USER (PUBLIC)
        // ==========================================

        // GET: api/news
        // Lấy danh sách bài viết (Chỉ lấy bài Published, có phân trang)
        [HttpGet]
        public async Task<IActionResult> GetNewsPublic(int page = 1, int limit = 6, string? search = null)
        {
            var result = await _newsQueryService.GetPublishedAsync(page, limit, search);
            return Ok(new { Items = result.Items, TotalPages = Math.Ceiling(result.TotalItems / (double)limit) });
        }

        // GET: api/news/details/slug-bai-viet
        // Lấy chi tiết bài viết & TĂNG VIEW
        [HttpGet("details/{slug}")]
        public async Task<IActionResult> GetNewsBySlug(string slug)
        {
            var news = await _newsQueryService.GetBySlugAsync(slug);
            return news is null ? NotFound() : Ok(news);
        }

        // ==========================================
        // 2. DÀNH CHO ADMIN
        // ==========================================

        // POST: api/news
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateNews([FromBody] CreateNewsDto dto)
        {
            var id = await _newsAdminService.CreateAsync(dto, User.FindFirstValue(ClaimTypes.NameIdentifier));
            return Ok(new { Message = "Đăng bài thành công", Id = id });
        }

        // PUT: api/news/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateNews(int id, [FromBody] CreateNewsDto dto)
        {
            return await _newsAdminService.UpdateAsync(id, dto)
                ? Ok(new { Message = "Cập nhật bài viết thành công" })
                : NotFound("Không tìm thấy bài viết");
        }

        // DELETE: api/news/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteNews(int id)
        {
            return await _newsAdminService.DeleteAsync(id)
                ? Ok(new { Message = "Đã xóa bài viết" })
                : NotFound();
        }

        // GET: api/news/{id} (Lấy chi tiết để Admin sửa - KHÔNG tăng View)
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetNewsByIdAdmin(int id)
        {
            var news = await _newsAdminService.GetByIdAsync(id);
            return news is null ? NotFound() : Ok(news);
        }

        // GET: api/news/admin-list
        [HttpGet("admin-list")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetNewsListAdmin()
        {
            return Ok(await _newsAdminService.GetListAsync());
        }

        // ==========================================
        // 3. API BÌNH LUẬN (COMMENTS)
        // ==========================================

        // GET: api/news/{newsId}/comments
        [HttpGet("{newsId}/comments")]
        public async Task<IActionResult> GetComments(int newsId)
        {
            return Ok(await _newsCommentService.GetByNewsIdAsync(newsId));
        }

        // POST: api/news/{newsId}/comments
        [HttpPost("{newsId}/comments")]
        [Authorize] // Bắt buộc đăng nhập
        public async Task<IActionResult> AddComment(int newsId, [FromBody] AddNewsCommentRequest dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(dto.Content)) return BadRequest("Nội dung không được để trống");
            if (!await _newsCommentService.AddAsync(newsId, userId, dto)) return NotFound("Bài viết không tồn tại");
            return Ok(new { Message = "Đã gửi bình luận thành công!" });
        }
    }
}