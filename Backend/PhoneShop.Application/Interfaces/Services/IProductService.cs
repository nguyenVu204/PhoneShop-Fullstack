using PhoneShop.API.Models;
using PhoneShop.API.Dtos;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Application.Interfaces.Services;

public interface IProductService
{
    Task<(IReadOnlyList<ProductListItem> Items, int TotalPages)> GetPagedAsync(string? search, int? brandId, decimal? minPrice, decimal? maxPrice, string? sort, int page, int limit, CancellationToken cancellationToken = default);
    Task<ProductDetailDto?> GetDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<Product> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductDeleteVariantResult> DeleteVariantAsync(int variantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductPromotionItem>> GetPromotionItemsAsync(string? search, bool? onlyDiscounted, CancellationToken cancellationToken = default);
    Task<ProductPromotionUpdateResult> UpdateDiscountAsync(int id, decimal? discountPrice, CancellationToken cancellationToken = default);
}

public enum ProductDeleteVariantResult
{
    NotFound,
    UsedInOrder,
    Deleted
}

public enum ProductPromotionUpdateResult
{
    NotFound,
    InvalidPrice,
    Updated
}