using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Repositories;

public interface IBrandRepository
{
    Task<IReadOnlyList<Brand>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Brand?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<BrandProductsDto?> GetProductsAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> HasProductsAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Brand brand, CancellationToken cancellationToken = default);
    void Remove(Brand brand);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}