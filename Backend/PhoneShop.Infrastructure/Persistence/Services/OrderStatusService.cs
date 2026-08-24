using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Infrastructure.Persistence.Services;

public class OrderStatusService : IOrderStatusService
{
    private readonly AppDbContext _context;

    public OrderStatusService(AppDbContext context)
    {
        _context = context;
    }

    public Task<bool> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default)
        => UpdateAsync(id, order => order.Status = status, cancellationToken);

    public Task<bool> UpdatePaymentStatusAsync(int id, string status, CancellationToken cancellationToken = default)
        => UpdateAsync(id, order => order.PaymentStatus = status, cancellationToken);

    private async Task<bool> UpdateAsync(int id, Action<PhoneShop.API.Models.Order> update, CancellationToken cancellationToken)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (order is null) return false;
        update(order);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}