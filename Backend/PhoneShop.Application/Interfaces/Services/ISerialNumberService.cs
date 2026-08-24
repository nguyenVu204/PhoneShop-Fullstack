using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Services;

public interface ISerialNumberService
{
    Task<(bool Found, int Added, int Stock)> AddRangeAsync(AddSerialNumbersRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AvailableSerialDto>> GetAvailableAsync(int variantId, CancellationToken cancellationToken = default);
}