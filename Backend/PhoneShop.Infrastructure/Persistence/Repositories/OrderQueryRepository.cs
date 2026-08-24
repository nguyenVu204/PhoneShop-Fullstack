using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class OrderQueryRepository : IOrderQueryRepository
{
    private readonly AppDbContext _context;

    public OrderQueryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<Order> Items, int TotalItems, int TotalPages)> GetMineAsync(string userId, int page, int limit, CancellationToken cancellationToken = default)
    {
        var query = BuildQuery().Where(order => order.UserId == userId).OrderByDescending(order => order.OrderDate);
        return await PageAsync(query, page, limit, cancellationToken);
    }

    public async Task<(IReadOnlyList<Order> Items, int TotalItems, int TotalPages)> GetAdminAsync(string? search, int page, int limit, CancellationToken cancellationToken = default)
    {
        var query = BuildQuery();
        if (!string.IsNullOrEmpty(search))
            query = query.Where(order => order.CustomerName.Contains(search) || order.CustomerPhone.Contains(search) || order.Id.ToString().Contains(search));
        return await PageAsync(query.OrderByDescending(order => order.OrderDate), page, limit, cancellationToken);
    }

    public Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => BuildQuery().FirstOrDefaultAsync(order => order.Id == id, cancellationToken);

    private IQueryable<Order> BuildQuery()
        => _context.Orders.Include(order => order.OrderDetails).ThenInclude(detail => detail.ProductVariant).ThenInclude(variant => variant.Product).AsNoTracking();

    private static async Task<(IReadOnlyList<Order> Items, int TotalItems, int TotalPages)> PageAsync(IQueryable<Order> query, int page, int limit, CancellationToken cancellationToken)
    {
        var totalItems = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync(cancellationToken);
        return (items, totalItems, (int)Math.Ceiling(totalItems / (double)limit));
    }
}