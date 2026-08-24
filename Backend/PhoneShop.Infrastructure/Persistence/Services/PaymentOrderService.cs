using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Infrastructure.Persistence.Services;

public class PaymentOrderService : IPaymentOrderService
{
    private readonly AppDbContext _context;

    public PaymentOrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<decimal?> GetTotalAmountAsync(int orderId, CancellationToken cancellationToken = default)
        => await _context.Orders
            .Where(order => order.Id == orderId)
            .Select(order => (decimal?)order.TotalAmount)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<bool> MarkPaidAsync(int orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(item => item.Id == orderId, cancellationToken);
        if (order is null)
            return false;

        order.PaymentStatus = "Paid";
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}