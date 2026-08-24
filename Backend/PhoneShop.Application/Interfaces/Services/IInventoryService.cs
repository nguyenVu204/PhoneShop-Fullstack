using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Services;

public interface IInventoryService
{
    Task<IReadOnlyList<InventoryItemDto>> GetInventoryAsync(CancellationToken cancellationToken = default);
}