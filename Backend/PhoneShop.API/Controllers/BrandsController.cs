using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneShop.API.Models;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandsController : ControllerBase
    {
        private readonly IBrandService _brandService;

        public BrandsController(IBrandService brandService)
        {
            _brandService = brandService;
        }

        // GET: api/brands
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Brand>>> GetBrands()
        {
            return Ok(await _brandService.GetAllAsync());
        }

        // ========================================================
        // TÍNH NĂNG MỚI: LẤY CHI TIẾT SẢN PHẨM & LỊCH SỬ XUẤT CỦA HÃNG
        // GET: api/brands/{id}/products
        // ========================================================
        [HttpGet("{id}/products")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBrandProducts(int id)
        {
            var products = await _brandService.GetProductsAsync(id);
            return products is null ? NotFound() : Ok(products);
        }

        // POST: api/brands (Thêm mới)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Brand>> CreateBrand(Brand brand)
        {
            await _brandService.CreateAsync(brand);
            return CreatedAtAction(nameof(GetBrands), new { id = brand.Id }, brand);
        }

        // PUT: api/brands/5 (Sửa tên)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBrand(int id, Brand brand)
        {
            if (id != brand.Id) return BadRequest();

            return await _brandService.UpdateAsync(id, brand)
                ? Ok(new { Message = "Cập nhật thành công" })
                : NotFound();
        }

        // DELETE: api/brands/5 (Xóa)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBrand(int id)
        {
            return (await _brandService.DeleteAsync(id)) switch
            {
                BrandDeleteResult.NotFound => NotFound(),
                BrandDeleteResult.HasProducts => BadRequest(new { Message = "Không thể xóa hãng này vì đang có sản phẩm liên kết!" }),
                _ => Ok(new { Message = "Đã xóa thành công" })
            };
        }
    }
}