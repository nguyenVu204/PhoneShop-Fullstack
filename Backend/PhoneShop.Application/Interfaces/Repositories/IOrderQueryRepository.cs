using PhoneShop.API.Models;

namespace PhoneShop.Application.Interfaces.Repositories;

public interface IOrderQueryRepository
{
    Task<(IReadOnlyList<Order> Items, int TotalItems, int TotalPages)> GetMineAsync(string userId, int page, int limit, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Order> Items, int TotalItems, int TotalPages)> GetAdminAsync(string? search, int page, int limit, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}