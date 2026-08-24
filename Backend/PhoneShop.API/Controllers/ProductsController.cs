using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IProductExportService _productExportService;
        private readonly IProductImportService _productImportService;

        public ProductsController(IProductService productService, IProductExportService productExportService, IProductImportService productImportService)
        {
            _productService = productService;
            _productExportService = productExportService;
            _productImportService = productImportService;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetProducts([FromQuery] string? search, [FromQuery] int? brandId, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice, [FromQuery] string? sort, [FromQuery] int page = 1, [FromQuery] int limit = 8)
        {
            var result = await _productService.GetPagedAsync(search, brandId, minPrice, maxPrice, sort, page, limit);
            return Ok(new { Items = result.Items, TotalPages = result.TotalPages, CurrentPage = page });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDetailDto>> GetProduct(int id)
        {
            var product = await _productService.GetDetailsAsync(id);
            return product is null ? NotFound() : Ok(product);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Product>> CreateProduct(CreateProductDto dto)
        {
            var product = await _productService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto dto)
        {
            return await _productService.UpdateAsync(id, dto)
                ? Ok(new { Message = "Cập nhật thành công!" })
                : NotFound("Không tìm thấy sản phẩm");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            return await _productService.DeleteAsync(id)
                ? Ok(new { Message = "Đã xóa sản phẩm thành công" })
                : NotFound();
        }

        [HttpDelete("variant/{variantId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVariant(int variantId)
        {
            return (await _productService.DeleteVariantAsync(variantId)) switch
            {
                ProductDeleteVariantResult.NotFound => NotFound("Không tìm thấy phiên bản này."),
                ProductDeleteVariantResult.UsedInOrder => BadRequest("Không thể xóa vì đã có khách hàng mua phiên bản này. Giải pháp: Hãy set Tồn kho = 0."),
                _ => Ok(new { Message = "Xóa phiên bản thành công" })
            };
        }

        [HttpGet("export")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportProducts()
        {
            var file = await _productExportService.ExportAsync();
            return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Products.xlsx");
        }

        [HttpPost("import")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportProducts(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Vui lòng chọn file Excel");
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;
            var countSuccess = await _productImportService.ImportAsync(stream);
            return Ok(new { Message = $"Đã nhập thành công {countSuccess} phiên bản sản phẩm." });
        }

        [HttpGet("variants-promo")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllVariantsForPromo([FromQuery] string? search, [FromQuery] bool? onlyDiscounted)
        {
            return Ok(await _productService.GetPromotionItemsAsync(search, onlyDiscounted));
        }

        public class UpdateDiscountDto { public decimal? DiscountPrice { get; set; } }

        [HttpPut("variants/{id}/discount")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> QuickUpdateDiscount(int id, [FromBody] UpdateDiscountDto dto)
        {
            return (await _productService.UpdateDiscountAsync(id, dto.DiscountPrice)) switch
            {
                ProductPromotionUpdateResult.NotFound => NotFound("Không tìm thấy phiên bản sản phẩm."),
                ProductPromotionUpdateResult.InvalidPrice => BadRequest("Giá khuyến mãi phải NHỎ HƠN giá gốc."),
                _ => Ok(new { Message = "Cập nhật trạng thái khuyến mãi thành công!" })
            };
        }
    }
}
