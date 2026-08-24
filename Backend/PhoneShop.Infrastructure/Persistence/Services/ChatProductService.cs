using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Infrastructure.Persistence.Services;

public class ChatProductService : IChatProductService
{
    private readonly AppDbContext _context;

    public ChatProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ChatProductContext>> GetProductsAsync(string message, CancellationToken cancellationToken = default)
    {
        var products = await QueryAsync(message, cancellationToken);
        return products.Count > 0 ? products : await QueryAsync(null, cancellationToken);
    }

    private async Task<List<ChatProductContext>> QueryAsync(string? message, CancellationToken cancellationToken)
    {
        var query = _context.Products.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(message))
            query = query.Where(product => product.Name.Contains(message) || product.Brand!.Name.Contains(message));

        return await query.Take(5).Select(product => new ChatProductContext
        {
            Id = product.Id,
            Name = product.Name,
            Brand = product.Brand!.Name,
            LowestPrice = product.Variants.Any() ? product.Variants.Min(variant => variant.Price) : 0,
            Configuration = $"{product.Chip}, {product.Screen}, {product.Battery}"
        }).ToListAsync(cancellationToken);
    }
}
