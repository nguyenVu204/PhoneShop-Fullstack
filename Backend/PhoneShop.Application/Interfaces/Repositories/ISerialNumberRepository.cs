using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Repositories;

public interface ISerialNumberRepository
{
    Task<ProductVariant?> GetVariantAsync(int variantId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string serialNumber, CancellationToken cancellationToken = default);
    Task AddAsync(ProductSerialNumber serialNumber, CancellationToken cancellationToken = default);
    Task<int> CountAvailableAsync(int variantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AvailableSerialDto>> GetAvailableAsync(int variantId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}