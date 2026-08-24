using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Services;

public interface IBrandService
{
    Task<IReadOnlyList<Brand>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<BrandProductsDto?> GetProductsAsync(int id, CancellationToken cancellationToken = default);
    Task<Brand?> CreateAsync(Brand brand, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, Brand brand, CancellationToken cancellationToken = default);
    Task<BrandDeleteResult> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

public enum BrandDeleteResult
{
    NotFound,
    HasProducts,
    Deleted
}