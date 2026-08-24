using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _repository;

    public InventoryService(IInventoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<InventoryItemDto>> GetInventoryAsync(CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetItemsAsync(cancellationToken);

        foreach (var item in items)
        {
            item.LastSoldDate = item.LastSoldDateValue?.ToString("dd/MM/yyyy HH:mm") ?? "Chưa từng bán";
            item.Status = GetInventoryStatus(item.StockQuantity, item.LastSoldDateValue);
        }

        return items
            .OrderBy(item => item.Status == "Out" ? 1 : item.Status == "Low" ? 2 : item.Status == "Old" ? 3 : 4)
            .ThenBy(item => item.StockQuantity)
            .ToList();
    }

    private static string GetInventoryStatus(int stock, DateTime? lastSold)
    {
        if (stock == 0) return "Out";
        if (stock <= 5) return "Low";
        if (!lastSold.HasValue || lastSold.Value < DateTime.Now.AddDays(-30)) return "Old";
        return "Normal";
    }
}