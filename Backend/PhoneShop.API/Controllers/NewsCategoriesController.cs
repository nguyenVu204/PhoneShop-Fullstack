using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneShop.API.Models;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsCategoriesController : ControllerBase
    {
        private readonly INewsCategoryService _categoryService;

        public NewsCategoriesController(INewsCategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // 1. Lấy danh sách danh mục (Public để dùng ở cả Admin và trang chủ)
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            return Ok(await _categoryService.GetAllAsync());
        }

        // 2. Thêm danh mục mới (Admin)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] NewsCategory dto)
        {
            var category = await _categoryService.CreateAsync(dto);
            if (category is null) return BadRequest("Tên danh mục không được để trống");

            return Ok(new { Message = "Thêm danh mục thành công", Category = dto });
        }

        // 3. Sửa danh mục (Admin)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] NewsCategory dto)
        {
            return await _categoryService.UpdateAsync(id, dto)
                ? Ok(new { Message = "Cập nhật thành công" })
                : NotFound();
        }

        // 4. Xóa danh mục (Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            return (await _categoryService.DeleteAsync(id)) switch
            {
                NewsCategoryDeleteResult.NotFound => NotFound(),
                NewsCategoryDeleteResult.InUse => BadRequest("Không thể xóa danh mục đang có bài viết!"),
                _ => Ok(new { Message = "Xóa thành công" })
            };
        }
    }
}