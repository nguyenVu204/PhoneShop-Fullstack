using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class FavoriteService : IFavoriteService
{
    private readonly IFavoriteRepository _repository;

    public FavoriteService(IFavoriteRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<int>> GetIdsAsync(string userId, CancellationToken cancellationToken = default)
        => _repository.GetIdsAsync(userId, cancellationToken);

    public Task<IReadOnlyList<FavoriteProductDto>> GetProductsAsync(string userId, CancellationToken cancellationToken = default)
        => _repository.GetProductsAsync(userId, cancellationToken);

    public async Task<bool> ToggleAsync(string userId, int productId, CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetAsync(userId, productId, cancellationToken);
        if (existing is not null)
        {
            _repository.Remove(existing);
            await _repository.SaveChangesAsync(cancellationToken);
            return false;
        }

        await _repository.AddAsync(new Favorite { UserId = userId, ProductId = productId }, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }
}