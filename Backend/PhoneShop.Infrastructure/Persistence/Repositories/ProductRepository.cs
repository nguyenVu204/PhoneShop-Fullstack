using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<ProductListItem> Items, int TotalPages)> GetPagedAsync(
        string? search, int? brandId, decimal? minPrice, decimal? maxPrice, string? sort,
        int page, int limit, CancellationToken cancellationToken = default)
    {
        var query = _context.Products.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(search)) query = query.Where(product => product.Name.Contains(search));
        if (brandId.HasValue) query = query.Where(product => product.BrandId == brandId);
        if (minPrice.HasValue) query = query.Where(product => product.Variants.Any(variant => (variant.DiscountPrice ?? variant.Price) >= minPrice));
        if (maxPrice.HasValue) query = query.Where(product => product.Variants.Any(variant => (variant.DiscountPrice ?? variant.Price) <= maxPrice));

        query = sort switch
        {
            "price_asc" => query.OrderBy(product => product.Variants.Min(variant => variant.DiscountPrice ?? variant.Price)),
            "price_desc" => query.OrderByDescending(product => product.Variants.Min(variant => variant.DiscountPrice ?? variant.Price)),
            "name_asc" => query.OrderBy(product => product.Name),
            _ => query.OrderByDescending(product => product.Id)
        };

        var totalItems = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalItems / (double)limit);
        var items = await query.Skip((page - 1) * limit).Take(limit)
            .Select(product => new ProductListItem
            {
                Id = product.Id,
                Name = product.Name,
                Thumbnail = product.Thumbnail,
                BrandName = product.Brand!.Name,
                MinPrice = product.Variants.Any() ? product.Variants.Min(variant => variant.Price) : 0,
                MinDiscountPrice = product.Variants.Where(variant => variant.DiscountPrice > 0).Select(variant => variant.DiscountPrice).Min()
            })
            .ToListAsync(cancellationToken);

        return (items, totalPages);
    }

    public Task<Product?> GetDetailsAsync(int id, CancellationToken cancellationToken = default)
        => _context.Products.AsNoTracking().Include(product => product.Brand).Include(product => product.Variants)
            .FirstOrDefaultAsync(product => product.Id == id, cancellationToken);

    public Task<Product?> GetForUpdateAsync(int id, CancellationToken cancellationToken = default)
        => _context.Products.Include(product => product.Variants).FirstOrDefaultAsync(product => product.Id == id, cancellationToken);

    public Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => _context.Products.FirstOrDefaultAsync(product => product.Id == id, cancellationToken);

    public Task<ProductVariant?> GetVariantAsync(int id, CancellationToken cancellationToken = default)
        => _context.ProductVariants.FirstOrDefaultAsync(variant => variant.Id == id, cancellationToken);

    public async Task<IReadOnlyList<ProductPromotionItem>> GetPromotionItemsAsync(string? search, bool? onlyDiscounted, CancellationToken cancellationToken = default)
    {
        var query = _context.ProductVariants.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(search)) query = query.Where(variant => variant.Product!.Name.Contains(search) || variant.Color.Contains(search));
        if (onlyDiscounted == true) query = query.Where(variant => variant.DiscountPrice != null && variant.DiscountPrice > 0);

        return await query.Select(variant => new ProductPromotionItem
        {
            Id = variant.Id, ProductId = variant.ProductId, ProductName = variant.Product!.Name,
            BrandName = variant.Product.Brand!.Name, Color = variant.Color, Ram = variant.Ram, Rom = variant.Rom,
            Price = variant.Price, DiscountPrice = variant.DiscountPrice, ImageUrl = variant.ImageUrl,
            StockQuantity = variant.StockQuantity
        }).OrderByDescending(item => item.DiscountPrice != null).ThenBy(item => item.ProductName).ToListAsync(cancellationToken);
    }

    public Task<bool> IsVariantUsedInOrderAsync(int variantId, CancellationToken cancellationToken = default)
        => _context.OrderDetails.AnyAsync(detail => detail.ProductVariantId == variantId, cancellationToken);

    public Task<List<ProductSerialNumber>> GetSerialsAsync(int variantId, CancellationToken cancellationToken = default)
        => _context.ProductSerialNumbers.Where(serial => serial.ProductVariantId == variantId).ToListAsync(cancellationToken);

    public Task AddAsync(Product product, CancellationToken cancellationToken = default)
        => _context.Products.AddAsync(product, cancellationToken).AsTask();

    public void Remove(Product product) => _context.Products.Remove(product);
    public void RemoveVariant(ProductVariant variant) => _context.ProductVariants.Remove(variant);
    public void RemoveSerials(IEnumerable<ProductSerialNumber> serials) => _context.ProductSerialNumbers.RemoveRange(serials);
    public Task SaveChangesAsync(CancellationToken cancellationToken = default) => _context.SaveChangesAsync(cancellationToken);
}