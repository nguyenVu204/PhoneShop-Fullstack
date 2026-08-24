using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Services;

public interface IFavoriteService
{
    Task<IReadOnlyList<int>> GetIdsAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FavoriteProductDto>> GetProductsAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> ToggleAsync(string userId, int productId, CancellationToken cancellationToken = default);
}