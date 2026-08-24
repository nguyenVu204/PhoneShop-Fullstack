using PhoneShop.API.Models;

namespace PhoneShop.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<(IReadOnlyList<ProductListItem> Items, int TotalPages)> GetPagedAsync(
        string? search, int? brandId, decimal? minPrice, decimal? maxPrice,
        string? sort, int page, int limit, CancellationToken cancellationToken = default);
    Task<Product?> GetDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<Product?> GetForUpdateAsync(int id, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductVariant?> GetVariantAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductPromotionItem>> GetPromotionItemsAsync(string? search, bool? onlyDiscounted, CancellationToken cancellationToken = default);
    Task<bool> IsVariantUsedInOrderAsync(int variantId, CancellationToken cancellationToken = default);
    Task<List<ProductSerialNumber>> GetSerialsAsync(int variantId, CancellationToken cancellationToken = default);
    Task AddAsync(Product product, CancellationToken cancellationToken = default);
    void Remove(Product product);
    void RemoveVariant(ProductVariant variant);
    void RemoveSerials(IEnumerable<ProductSerialNumber> serials);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public class ProductListItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Thumbnail { get; set; }
    public string? BrandName { get; set; }
    public decimal MinPrice { get; set; }
    public decimal? MinDiscountPrice { get; set; }
}

public class ProductPromotionItem
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Ram { get; set; } = string.Empty;
    public string Rom { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? ImageUrl { get; set; }
    public int StockQuantity { get; set; }
}