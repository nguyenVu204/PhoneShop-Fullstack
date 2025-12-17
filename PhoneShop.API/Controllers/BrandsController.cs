using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BrandsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/brands
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Brand>>> GetBrands()
        {
            return await _context.Brands.ToListAsync();
        }

        // POST: api/brands (Thêm mới)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Brand>> CreateBrand(Brand brand)
        {
            _context.Brands.Add(brand);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBrands), new { id = brand.Id }, brand);
        }

        // PUT: api/brands/5 (Sửa tên)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBrand(int id, Brand brand)
        {
            if (id != brand.Id) return BadRequest();

            var existingBrand = await _context.Brands.FindAsync(id);
            if (existingBrand == null) return NotFound();

            existingBrand.Name = brand.Name; // Cập nhật tên

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công" });
        }

        // DELETE: api/brands/5 (Xóa)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBrand(int id)
        {
            var brand = await _context.Brands.FindAsync(id);
            if (brand == null) return NotFound();

            // Kiểm tra: Nếu hãng này đang có sản phẩm thì không cho xóa (để tránh lỗi database)
            var hasProducts = await _context.Products.AnyAsync(p => p.BrandId == id);
            if (hasProducts)
            {
                return BadRequest(new { Message = "Không thể xóa hãng này vì đang có sản phẩm liên kết!" });
            }

            _context.Brands.Remove(brand);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa thành công" });
        }
    }
}