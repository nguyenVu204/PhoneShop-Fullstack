using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Infrastructure.Persistence.Services;

public class OrderCommandService : IOrderCommandService
{
    private readonly AppDbContext _context;

    public OrderCommandService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CreateOrderResult> CreateAsync(PhoneShop.API.Dtos.CreateOrderDto request, string? userId, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        var order = new Order
        {
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            ShippingAddress = request.ShippingAddress,
            OrderDate = DateTime.Now,
            Status = "Pending",
            UserId = userId,
            PaymentMethod = request.PaymentMethod ?? "COD",
            PaymentStatus = "Unpaid"
        };
        var total = 0m;

        foreach (var item in request.Items)
        {
            var variant = await _context.ProductVariants.FindAsync(new object[] { item.VariantId }, cancellationToken);
            if (variant is null)
                return new CreateOrderResult { Error = $"Sản phẩm ID {item.VariantId} không tồn tại." };

            var activePrice = variant.DiscountPrice is > 0 ? variant.DiscountPrice.Value : variant.Price;
            var serials = await _context.ProductSerialNumbers
                .Where(serial => serial.ProductVariantId == item.VariantId && serial.Status == "Available")
                .OrderBy(serial => serial.Id)
                .Take(item.Quantity)
                .ToListAsync(cancellationToken);
            if (serials.Count < item.Quantity)
                return new CreateOrderResult { Error = $"Sản phẩm {variant.Color} chỉ còn {serials.Count} máy (IMEI) khả dụng, không đủ số lượng {item.Quantity} yêu cầu." };

            foreach (var serial in serials)
            {
                serial.Status = "Sold";
                serial.Order = order;
            }

            variant.StockQuantity -= item.Quantity;
            order.OrderDetails.Add(new OrderDetail
            {
                ProductVariantId = item.VariantId,
                Quantity = item.Quantity,
                UnitPrice = activePrice,
                Order = order,
                SerialNumber = string.Join(", ", serials.Select(serial => serial.SerialNumber))
            });
            total += activePrice * item.Quantity;
        }

        order.TotalAmount = total;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new CreateOrderResult { Succeeded = true, OrderId = order.Id, Total = total };
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        var order = await _context.Orders.Include(item => item.OrderDetails).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (order is null) return false;

        foreach (var detail in order.OrderDetails)
        {
            var variant = await _context.ProductVariants.FindAsync(new object[] { detail.ProductVariantId }, cancellationToken);
            if (variant is not null) variant.StockQuantity += detail.Quantity;
        }

        var serials = await _context.ProductSerialNumbers.Where(serial => serial.OrderId == id).ToListAsync(cancellationToken);
        foreach (var serial in serials)
        {
            serial.Status = "Available";
            serial.OrderId = null;
        }

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return true;
    }

    public async Task<AssignImeiResult> AssignImeiAsync(PhoneShop.API.Dtos.AssignImeiDto request, CancellationToken cancellationToken = default)
    {
        var serial = await _context.ProductSerialNumbers.FindAsync(new object[] { request.SerialNumberId }, cancellationToken);
        if (serial is null || serial.Status != "Available")
            return new AssignImeiResult { Error = "IMEI không tồn tại hoặc đã được bán." };

        var detail = await _context.OrderDetails.FirstOrDefaultAsync(item => item.OrderId == request.OrderId && item.ProductVariantId == request.ProductVariantId, cancellationToken);
        if (detail is null) return new AssignImeiResult { NotFound = true, Error = "Không tìm thấy dòng sản phẩm này trong đơn hàng." };

        if (string.IsNullOrEmpty(detail.SerialNumber)) detail.SerialNumber = serial.SerialNumber;
        else
        {
            var currentImeis = detail.SerialNumber.Split(", ");
            if (currentImeis.Length >= detail.Quantity) return new AssignImeiResult { Error = $"Đã gán đủ {detail.Quantity} IMEI cho sản phẩm này rồi." };
            if (!detail.SerialNumber.Contains(serial.SerialNumber)) detail.SerialNumber += ", " + serial.SerialNumber;
        }

        serial.Status = "Sold";
        serial.OrderId = request.OrderId;
        var variant = await _context.ProductVariants.FindAsync(new object[] { serial.ProductVariantId }, cancellationToken);
        if (variant is not null) variant.StockQuantity -= 1;
        await _context.SaveChangesAsync(cancellationToken);
        return new AssignImeiResult { Succeeded = true, SerialNumber = detail.SerialNumber };
    }
}