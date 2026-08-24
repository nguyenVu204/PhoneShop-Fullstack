using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Repositories;

public interface IInventoryRepository
{
    Task<IReadOnlyList<InventoryItemDto>> GetItemsAsync(CancellationToken cancellationToken = default);
}