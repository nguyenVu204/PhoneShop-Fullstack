using PhoneShop.API.Dtos;
using PhoneShop.API.Models;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public Task<(IReadOnlyList<ProductListItem> Items, int TotalPages)> GetPagedAsync(string? search, int? brandId, decimal? minPrice, decimal? maxPrice, string? sort, int page, int limit, CancellationToken cancellationToken = default)
        => _repository.GetPagedAsync(search, brandId, minPrice, maxPrice, sort, page, limit, cancellationToken);

    public async Task<ProductDetailDto?> GetDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _repository.GetDetailsAsync(id, cancellationToken);
        if (product is null) return null;

        return new ProductDetailDto
        {
            Id = product.Id,
            Name = product.Name,
            BrandName = product.Brand?.Name ?? "N/A",
            BrandId = product.BrandId ?? 0,
            Description = product.Description,
            Thumbnail = product.Thumbnail,
            Screen = product.Screen,
            Chip = product.Chip,
            Battery = product.Battery,
            RearCamera = product.RearCamera,
            FrontCamera = product.FrontCamera,
            OperatingSystem = product.OperatingSystem,
            Variants = product.Variants.Select(variant => new ProductVariantDto
            {
                Id = variant.Id,
                Color = variant.Color,
                Ram = variant.Ram,
                Rom = variant.Rom,
                Price = variant.Price,
                DiscountPrice = variant.DiscountPrice,
                StockQuantity = variant.StockQuantity,
                ImageUrl = variant.ImageUrl
            }).ToList()
        };
    }

    public async Task<Product> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = new Product
        {
            Name = dto.Name, Description = dto.Description, Thumbnail = dto.Thumbnail, BrandId = dto.BrandId,
            Screen = dto.Screen, Chip = dto.Chip, Battery = dto.Battery, RearCamera = dto.RearCamera,
            FrontCamera = dto.FrontCamera, OperatingSystem = dto.OperatingSystem
        };

        foreach (var variant in dto.Variants)
            product.Variants.Add(new ProductVariant
            {
                Color = variant.Color, Ram = variant.Ram, Rom = variant.Rom, Price = variant.Price,
                DiscountPrice = variant.DiscountPrice > 0 ? variant.DiscountPrice : null,
                StockQuantity = variant.StockQuantity, ImageUrl = variant.ImageUrl
            });

        await _repository.AddAsync(product, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return product;
    }

    public async Task<bool> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _repository.GetForUpdateAsync(id, cancellationToken);
        if (product is null) return false;

        product.Name = dto.Name; product.Description = dto.Description; product.Thumbnail = dto.Thumbnail; product.BrandId = dto.BrandId;
        product.Screen = dto.Screen; product.Chip = dto.Chip; product.Battery = dto.Battery; product.RearCamera = dto.RearCamera;
        product.FrontCamera = dto.FrontCamera; product.OperatingSystem = dto.OperatingSystem;

        foreach (var variantDto in dto.Variants)
        {
            var variant = variantDto.Id > 0 ? product.Variants.FirstOrDefault(item => item.Id == variantDto.Id) : null;
            if (variantDto.Id > 0 && variant is null)
                continue;

            if (variant is null)
            {
                product.Variants.Add(new ProductVariant
                {
                    Color = variantDto.Color, Ram = variantDto.Ram, Rom = variantDto.Rom, Price = variantDto.Price,
                    DiscountPrice = variantDto.DiscountPrice > 0 ? variantDto.DiscountPrice : null,
                    StockQuantity = variantDto.StockQuantity, ImageUrl = variantDto.ImageUrl
                });
                continue;
            }

            variant.Color = variantDto.Color; variant.Ram = variantDto.Ram; variant.Rom = variantDto.Rom;
            variant.Price = variantDto.Price; variant.DiscountPrice = variantDto.DiscountPrice > 0 ? variantDto.DiscountPrice : null;
            variant.StockQuantity = variantDto.StockQuantity; variant.ImageUrl = variantDto.ImageUrl;
        }

        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _repository.GetByIdAsync(id, cancellationToken);
        if (product is null) return false;
        _repository.Remove(product);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<ProductDeleteVariantResult> DeleteVariantAsync(int variantId, CancellationToken cancellationToken = default)
    {
        var variant = await _repository.GetVariantAsync(variantId, cancellationToken);
        if (variant is null) return ProductDeleteVariantResult.NotFound;
        if (await _repository.IsVariantUsedInOrderAsync(variantId, cancellationToken)) return ProductDeleteVariantResult.UsedInOrder;

        var serials = await _repository.GetSerialsAsync(variantId, cancellationToken);
        _repository.RemoveSerials(serials);
        _repository.RemoveVariant(variant);
        await _repository.SaveChangesAsync(cancellationToken);
        return ProductDeleteVariantResult.Deleted;
    }

    public Task<IReadOnlyList<ProductPromotionItem>> GetPromotionItemsAsync(string? search, bool? onlyDiscounted, CancellationToken cancellationToken = default)
        => _repository.GetPromotionItemsAsync(search, onlyDiscounted, cancellationToken);

    public async Task<ProductPromotionUpdateResult> UpdateDiscountAsync(int id, decimal? discountPrice, CancellationToken cancellationToken = default)
    {
        var variant = await _repository.GetVariantAsync(id, cancellationToken);
        if (variant is null) return ProductPromotionUpdateResult.NotFound;
        if (discountPrice.HasValue && discountPrice > 0 && discountPrice >= variant.Price) return ProductPromotionUpdateResult.InvalidPrice;

        variant.DiscountPrice = discountPrice.HasValue && discountPrice > 0 ? discountPrice : null;
        await _repository.SaveChangesAsync(cancellationToken);
        return ProductPromotionUpdateResult.Updated;
    }
}