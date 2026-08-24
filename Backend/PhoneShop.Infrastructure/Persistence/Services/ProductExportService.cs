using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Infrastructure.Persistence.Services;

public class ProductExportService : IProductExportService
{
    private readonly AppDbContext _context;

    public ProductExportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> ExportAsync(CancellationToken cancellationToken = default)
    {
        var products = await _context.Products.AsNoTracking().Include(product => product.Brand).Include(product => product.Variants).ToListAsync(cancellationToken);
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("DanhSachSanPham");
        var headers = new[] { "ID Máy", "Tên Sản Phẩm", "Hãng", "Màu Sắc", "RAM", "ROM", "Giá Gốc", "Giá Khuyến Mãi", "Tồn Kho", "Link Ảnh" };
        for (var index = 0; index < headers.Length; index++) worksheet.Cell(1, index + 1).Value = headers[index];
        worksheet.Range("A1:J1").Style.Font.Bold = true;
        worksheet.Range("A1:J1").Style.Fill.BackgroundColor = XLColor.LightGray;
        var row = 2;
        foreach (var product in products)
        {
            foreach (var variant in product.Variants.DefaultIfEmpty())
            {
                worksheet.Cell(row, 1).Value = product.Id; worksheet.Cell(row, 2).Value = product.Name; worksheet.Cell(row, 3).Value = product.Brand?.Name;
                if (variant is null) worksheet.Cell(row, 4).Value = "Chưa có";
                else { worksheet.Cell(row, 4).Value = variant.Color; worksheet.Cell(row, 5).Value = variant.Ram; worksheet.Cell(row, 6).Value = variant.Rom; worksheet.Cell(row, 7).Value = variant.Price; worksheet.Cell(row, 8).Value = variant.DiscountPrice ?? 0; worksheet.Cell(row, 9).Value = variant.StockQuantity; worksheet.Cell(row, 10).Value = variant.ImageUrl; }
                row++;
            }
        }
        worksheet.Columns().AdjustToContents();
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}