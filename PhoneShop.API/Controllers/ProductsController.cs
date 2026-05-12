using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetProducts(
            [FromQuery] string? search, [FromQuery] int? brandId, [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice, [FromQuery] string? sort,
            [FromQuery] int page = 1, [FromQuery] int limit = 8)
        {
            var query = _context.Products.Include(p => p.Brand).Include(p => p.Variants).AsQueryable();

            if (!string.IsNullOrEmpty(search)) query = query.Where(p => p.Name.Contains(search));
            if (brandId.HasValue) query = query.Where(p => p.BrandId == brandId);
            if (minPrice.HasValue) query = query.Where(p => p.Variants.Any(v => (v.DiscountPrice ?? v.Price) >= minPrice));
            if (maxPrice.HasValue) query = query.Where(p => p.Variants.Any(v => (v.DiscountPrice ?? v.Price) <= maxPrice));

            switch (sort)
            {
                case "price_asc": query = query.OrderBy(p => p.Variants.Min(v => v.DiscountPrice ?? v.Price)); break;
                case "price_desc": query = query.OrderByDescending(p => p.Variants.Min(v => v.DiscountPrice ?? v.Price)); break;
                case "name_asc": query = query.OrderBy(p => p.Name); break;
                case "newest": default: query = query.OrderByDescending(p => p.Id); break;
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

            var products = await query.Skip((page - 1) * limit).Take(limit)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Thumbnail,
                    BrandName = p.Brand.Name,
                    MinPrice = p.Variants.Any() ? p.Variants.Min(v => v.Price) : 0,
                    MinDiscountPrice = p.Variants.Where(v => v.DiscountPrice > 0).Any() ? p.Variants.Where(v => v.DiscountPrice > 0).Min(v => v.DiscountPrice) : null
                }).ToListAsync();

            return Ok(new { Items = products, TotalPages = totalPages, CurrentPage = page });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDetailDto>> GetProduct(int id)
        {
            var product = await _context.Products.Include(p => p.Brand).Include(p => p.Variants).FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound();

            var productDetail = new ProductDetailDto
            {
                Id = product.Id,
                Name = product.Name,
                BrandName = product.Brand?.Name ?? "N/A",
                BrandId = product.BrandId ?? 0,
                Description = product.Description,
                Thumbnail = product.Thumbnail,
                Screen = product.Screen,
                Chip = product.Chip,
                Battery = product.Battery,
                RearCamera = product.RearCamera,
                FrontCamera = product.FrontCamera,
                OperatingSystem = product.OperatingSystem,
                Variants = product.Variants.Select(v => new ProductVariantDto
                {
                    Id = v.Id,
                    Color = v.Color,
                    Ram = v.Ram,
                    Rom = v.Rom,
                    Price = v.Price,
                    DiscountPrice = v.DiscountPrice, // Lấy giá KM
                    StockQuantity = v.StockQuantity,
                    ImageUrl = v.ImageUrl,
                }).ToList()
            };
            return Ok(productDetail);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Product>> CreateProduct(CreateProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Thumbnail = dto.Thumbnail,
                BrandId = dto.BrandId,
                Screen = dto.Screen,
                Chip = dto.Chip,
                Battery = dto.Battery,
                RearCamera = dto.RearCamera,
                FrontCamera = dto.FrontCamera,
                OperatingSystem = dto.OperatingSystem
            };

            foreach (var v in dto.Variants)
            {
                product.Variants.Add(new ProductVariant
                {
                    Color = v.Color,
                    Ram = v.Ram,
                    Rom = v.Rom,
                    Price = v.Price,
                    DiscountPrice = v.DiscountPrice > 0 ? v.DiscountPrice : null, // Lưu giá KM
                    StockQuantity = v.StockQuantity,
                    ImageUrl = v.ImageUrl
                });
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto dto)
        {
            var product = await _context.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound("Không tìm thấy sản phẩm");

            product.Name = dto.Name; product.Description = dto.Description; product.Thumbnail = dto.Thumbnail; product.BrandId = dto.BrandId;
            product.Screen = dto.Screen; product.Chip = dto.Chip; product.Battery = dto.Battery; product.RearCamera = dto.RearCamera; product.FrontCamera = dto.FrontCamera; product.OperatingSystem = dto.OperatingSystem;

            foreach (var vDto in dto.Variants)
            {
                if (vDto.Id > 0)
                {
                    var existingVariant = product.Variants.FirstOrDefault(v => v.Id == vDto.Id);
                    if (existingVariant != null)
                    {
                        existingVariant.Color = vDto.Color; existingVariant.Ram = vDto.Ram; existingVariant.Rom = vDto.Rom;
                        existingVariant.Price = vDto.Price;
                        existingVariant.DiscountPrice = vDto.DiscountPrice > 0 ? vDto.DiscountPrice : null; // Cập nhật KM
                        existingVariant.StockQuantity = vDto.StockQuantity; existingVariant.ImageUrl = vDto.ImageUrl;
                    }
                }
                else
                {
                    product.Variants.Add(new ProductVariant
                    {
                        Color = vDto.Color,
                        Ram = vDto.Ram,
                        Rom = vDto.Rom,
                        Price = vDto.Price,
                        DiscountPrice = vDto.DiscountPrice > 0 ? vDto.DiscountPrice : null,
                        StockQuantity = vDto.StockQuantity,
                        ImageUrl = vDto.ImageUrl
                    });
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công!" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã xóa sản phẩm thành công" });
        }

        [HttpDelete("variant/{variantId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVariant(int variantId)
        {
            var variant = await _context.ProductVariants.FindAsync(variantId);
            if (variant == null) return NotFound("Không tìm thấy phiên bản này.");

            bool isUsedInOrder = await _context.OrderDetails.AnyAsync(od => od.ProductVariantId == variantId);
            if (isUsedInOrder) return BadRequest("Không thể xóa vì đã có khách hàng mua phiên bản này. Giải pháp: Hãy set Tồn kho = 0.");

            var serials = await _context.ProductSerialNumbers.Where(s => s.ProductVariantId == variantId).ToListAsync();
            if (serials.Any()) _context.ProductSerialNumbers.RemoveRange(serials);

            _context.ProductVariants.Remove(variant);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Xóa phiên bản thành công" });
        }

        [HttpGet("export")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportProducts()
        {
            var products = await _context.Products.Include(p => p.Brand).Include(p => p.Variants).ToListAsync();

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("DanhSachSanPham");
                worksheet.Cell(1, 1).Value = "ID Máy"; worksheet.Cell(1, 2).Value = "Tên Sản Phẩm";
                worksheet.Cell(1, 3).Value = "Hãng"; worksheet.Cell(1, 4).Value = "Màu Sắc";
                worksheet.Cell(1, 5).Value = "RAM"; worksheet.Cell(1, 6).Value = "ROM";
                worksheet.Cell(1, 7).Value = "Giá Gốc"; worksheet.Cell(1, 8).Value = "Giá Khuyến Mãi";
                worksheet.Cell(1, 9).Value = "Tồn Kho"; worksheet.Cell(1, 10).Value = "Link Ảnh";

                var headerRange = worksheet.Range("A1:J1");
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

                int row = 2;
                foreach (var p in products)
                {
                    if (p.Variants.Any())
                    {
                        foreach (var v in p.Variants)
                        {
                            worksheet.Cell(row, 1).Value = p.Id; worksheet.Cell(row, 2).Value = p.Name;
                            worksheet.Cell(row, 3).Value = p.Brand?.Name; worksheet.Cell(row, 4).Value = v.Color;
                            worksheet.Cell(row, 5).Value = v.Ram; worksheet.Cell(row, 6).Value = v.Rom;
                            worksheet.Cell(row, 7).Value = v.Price; worksheet.Cell(row, 8).Value = v.DiscountPrice ?? 0;
                            worksheet.Cell(row, 9).Value = v.StockQuantity; worksheet.Cell(row, 10).Value = v.ImageUrl;
                            row++;
                        }
                    }
                    else
                    {
                        worksheet.Cell(row, 1).Value = p.Id; worksheet.Cell(row, 2).Value = p.Name;
                        worksheet.Cell(row, 3).Value = p.Brand?.Name; worksheet.Cell(row, 4).Value = "Chưa có"; row++;
                    }
                }
                worksheet.Columns().AdjustToContents();
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Products.xlsx");
                }
            }
        }

        [HttpPost("import")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportProducts(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Vui lòng chọn file Excel");
            int countSuccess = 0;
            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var workbook = new XLWorkbook(stream))
                {
                    var rows = workbook.Worksheet(1).RangeUsed().RowsUsed().Skip(1);
                    foreach (var row in rows)
                    {
                        try
                        {
                            string pName = row.Cell(1).GetValue<string>(); string brandName = row.Cell(2).GetValue<string>();
                            string color = row.Cell(3).GetValue<string>(); string ram = row.Cell(4).GetValue<string>();
                            string rom = row.Cell(5).GetValue<string>(); decimal price = row.Cell(6).GetValue<decimal>();
                            decimal discountVal = row.Cell(7).GetValue<decimal>();
                            int stock = row.Cell(8).GetValue<int>(); string img = row.Cell(9).GetValue<string>();

                            if (string.IsNullOrEmpty(pName)) continue;

                            var brand = await _context.Brands.FirstOrDefaultAsync(b => b.Name == brandName);
                            if (brand == null) { brand = new Brand { Name = brandName }; _context.Brands.Add(brand); await _context.SaveChangesAsync(); }

                            var product = await _context.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.Name == pName);
                            if (product == null) { product = new Product { Name = pName, BrandId = brand.Id, Description = "Nhập từ Excel", Thumbnail = img }; _context.Products.Add(product); await _context.SaveChangesAsync(); }

                            if (!product.Variants.Any(v => v.Color == color && v.Rom == rom && v.Ram == ram))
                            {
                                _context.ProductVariants.Add(new ProductVariant
                                {
                                    ProductId = product.Id,
                                    Color = color,
                                    Ram = ram,
                                    Rom = rom,
                                    Price = price,
                                    DiscountPrice = discountVal > 0 ? discountVal : null,
                                    StockQuantity = stock,
                                    ImageUrl = img
                                });
                                countSuccess++;
                            }
                        }
                        catch (Exception) { continue; }
                    }
                    await _context.SaveChangesAsync();
                }
            }
            return Ok(new { Message = $"Đã nhập thành công {countSuccess} phiên bản sản phẩm." });
        }

        // ========================================================
        // --- API ADMIN: QUẢN LÝ KHUYẾN MÃI (PROMOTIONS) ---
        // ========================================================

        [HttpGet("variants-promo")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllVariantsForPromo([FromQuery] string? search, [FromQuery] bool? onlyDiscounted)
        {
            var query = _context.ProductVariants
                .Include(v => v.Product)
                .ThenInclude(p => p.Brand)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(v => v.Product.Name.Contains(search) || v.Color.Contains(search));
            }

            if (onlyDiscounted == true)
            {
                // Chỉ lấy những biến thể đang có giá KM > 0
                query = query.Where(v => v.DiscountPrice != null && v.DiscountPrice > 0);
            }

            var variants = await query
                .Select(v => new {
                    v.Id,
                    ProductId = v.ProductId,
                    ProductName = v.Product.Name,
                    BrandName = v.Product.Brand.Name,
                    v.Color,
                    v.Ram,
                    v.Rom,
                    v.Price,
                    v.DiscountPrice,
                    v.ImageUrl,
                    v.StockQuantity
                })
                // Sắp xếp: Đang sale lên đầu, sau đó theo tên
                .OrderByDescending(v => v.DiscountPrice != null)
                .ThenBy(v => v.ProductName)
                .ToListAsync();

            return Ok(variants);
        }

        public class UpdateDiscountDto
        {
            public decimal? DiscountPrice { get; set; }
        }

        [HttpPut("variants/{id}/discount")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> QuickUpdateDiscount(int id, [FromBody] UpdateDiscountDto dto)
        {
            var variant = await _context.ProductVariants.FindAsync(id);
            if (variant == null) return NotFound("Không tìm thấy phiên bản sản phẩm.");

            if (dto.DiscountPrice.HasValue && dto.DiscountPrice > 0 && dto.DiscountPrice >= variant.Price)
            {
                return BadRequest("Giá khuyến mãi phải NHỎ HƠN giá gốc.");
            }

            // Nếu truyền giá trị hợp lệ thì lưu, nếu bằng 0 hoặc null thì tắt khuyến mãi
            variant.DiscountPrice = (dto.DiscountPrice.HasValue && dto.DiscountPrice > 0) ? dto.DiscountPrice : null;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật trạng thái khuyến mãi thành công!" });
        }
    }
}