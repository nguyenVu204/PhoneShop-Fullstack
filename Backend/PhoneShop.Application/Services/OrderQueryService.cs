using PhoneShop.API.Models;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class OrderQueryService : IOrderQueryService
{
    private readonly IOrderQueryRepository _repository;

    public OrderQueryService(IOrderQueryRepository repository)
    {
        _repository = repository;
    }

    public Task<(IReadOnlyList<Order> Items, int TotalItems, int TotalPages)> GetMineAsync(string userId, int page, int limit, CancellationToken cancellationToken = default)
        => _repository.GetMineAsync(userId, page, limit, cancellationToken);

    public Task<(IReadOnlyList<Order> Items, int TotalItems, int TotalPages)> GetAdminAsync(string? search, int page, int limit, CancellationToken cancellationToken = default)
        => _repository.GetAdminAsync(search, page, limit, cancellationToken);

    public Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);
}