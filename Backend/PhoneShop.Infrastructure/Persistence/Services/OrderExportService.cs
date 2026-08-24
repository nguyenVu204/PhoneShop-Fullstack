using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Infrastructure.Persistence.Services;

public class OrderExportService : IOrderExportService
{
    private readonly AppDbContext _context;

    public OrderExportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> ExportAsync(CancellationToken cancellationToken = default)
    {
        var orders = await _context.Orders.AsNoTracking()
            .Include(order => order.OrderDetails).ThenInclude(detail => detail.ProductVariant).ThenInclude(variant => variant.Product)
            .OrderByDescending(order => order.OrderDate).ToListAsync(cancellationToken);
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("DonHang");
        var headers = new[] { "Mã Đơn", "Ngày Đặt", "Khách Hàng", "SĐT", "Địa Chỉ", "Tổng Tiền", "Trạng Thái", "Chi Tiết Sản Phẩm (Gộp)" };
        for (var index = 0; index < headers.Length; index++) worksheet.Cell(1, index + 1).Value = headers[index];
        worksheet.Range("A1:H1").Style.Font.Bold = true;
        var row = 2;
        foreach (var order in orders)
        {
            worksheet.Cell(row, 1).Value = order.Id; worksheet.Cell(row, 2).Value = order.OrderDate; worksheet.Cell(row, 3).Value = order.CustomerName;
            worksheet.Cell(row, 4).Value = $"'{order.CustomerPhone}"; worksheet.Cell(row, 5).Value = order.ShippingAddress; worksheet.Cell(row, 6).Value = order.TotalAmount; worksheet.Cell(row, 7).Value = order.Status;
            worksheet.Cell(row, 8).Value = string.Join("; ", order.OrderDetails.Select(detail => $"{detail.ProductVariant?.Product?.Name} ({detail.ProductVariant?.Color}) x{detail.Quantity}"));
            row++;
        }
        worksheet.Columns().AdjustToContents();
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}