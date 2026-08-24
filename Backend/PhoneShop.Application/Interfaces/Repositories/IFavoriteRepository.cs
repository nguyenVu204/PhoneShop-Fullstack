using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Repositories;

public interface IFavoriteRepository
{
    Task<IReadOnlyList<int>> GetIdsAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FavoriteProductDto>> GetProductsAsync(string userId, CancellationToken cancellationToken = default);
    Task<Favorite?> GetAsync(string userId, int productId, CancellationToken cancellationToken = default);
    Task AddAsync(Favorite favorite, CancellationToken cancellationToken = default);
    void Remove(Favorite favorite);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}