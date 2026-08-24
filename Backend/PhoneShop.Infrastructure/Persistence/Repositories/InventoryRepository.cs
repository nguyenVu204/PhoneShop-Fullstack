using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly AppDbContext _context;

    public InventoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<InventoryItemDto>> GetItemsAsync(CancellationToken cancellationToken = default)
        => await _context.ProductVariants
            .AsNoTracking()
            .Select(variant => new InventoryItemDto
            {
                Id = variant.Id,
                ProductId = variant.ProductId,
                ProductName = variant.Product!.Name,
                BrandName = variant.Product.Brand!.Name,
                VariantName = variant.Color + " - " + variant.Ram + "/" + variant.Rom,
                StockQuantity = variant.StockQuantity,
                Price = variant.Price,
                ImageUrl = variant.ImageUrl,
                LastSoldDateValue = _context.OrderDetails
                    .Where(detail => detail.ProductVariantId == variant.Id && detail.Order!.Status != "Cancelled")
                    .Max(detail => (DateTime?)detail.Order!.OrderDate)
            })
            .ToListAsync(cancellationToken);
}