using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Infrastructure.Persistence.Services;

public class ProductImportService : IProductImportService
{
    private readonly AppDbContext _context;

    public ProductImportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> ImportAsync(Stream stream, CancellationToken cancellationToken = default)
    {
        using var workbook = new XLWorkbook(stream);
        var countSuccess = 0;
        foreach (var row in workbook.Worksheet(1).RangeUsed().RowsUsed().Skip(1))
        {
            try
            {
                var productName = row.Cell(1).GetValue<string>();
                var brandName = row.Cell(2).GetValue<string>();
                var color = row.Cell(3).GetValue<string>();
                var ram = row.Cell(4).GetValue<string>();
                var rom = row.Cell(5).GetValue<string>();
                var price = row.Cell(6).GetValue<decimal>();
                var discountPrice = row.Cell(7).GetValue<decimal>();
                var stock = row.Cell(8).GetValue<int>();
                var imageUrl = row.Cell(9).GetValue<string>();
                if (string.IsNullOrEmpty(productName)) continue;

                var brand = await _context.Brands.FirstOrDefaultAsync(item => item.Name == brandName, cancellationToken);
                if (brand is null)
                {
                    brand = new Brand { Name = brandName };
                    _context.Brands.Add(brand);
                    await _context.SaveChangesAsync(cancellationToken);
                }

                var product = await _context.Products.Include(item => item.Variants).FirstOrDefaultAsync(item => item.Name == productName, cancellationToken);
                if (product is null)
                {
                    product = new Product { Name = productName, BrandId = brand.Id, Description = "Nhập từ Excel", Thumbnail = imageUrl };
                    _context.Products.Add(product);
                    await _context.SaveChangesAsync(cancellationToken);
                }

                if (product.Variants.Any(item => item.Color == color && item.Rom == rom && item.Ram == ram)) continue;
                _context.ProductVariants.Add(new ProductVariant { ProductId = product.Id, Color = color, Ram = ram, Rom = rom, Price = price, DiscountPrice = discountPrice > 0 ? discountPrice : null, StockQuantity = stock, ImageUrl = imageUrl });
                countSuccess++;
            }
            catch (Exception)
            {
                continue;
            }
        }
        await _context.SaveChangesAsync(cancellationToken);
        return countSuccess;
    }
}