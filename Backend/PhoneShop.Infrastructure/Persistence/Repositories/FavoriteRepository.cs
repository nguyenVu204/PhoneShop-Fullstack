using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly AppDbContext _context;

    public FavoriteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<int>> GetIdsAsync(string userId, CancellationToken cancellationToken = default)
        => await _context.Favorites
            .AsNoTracking()
            .Where(favorite => favorite.UserId == userId)
            .Select(favorite => favorite.ProductId)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<FavoriteProductDto>> GetProductsAsync(string userId, CancellationToken cancellationToken = default)
        => await _context.Favorites
            .AsNoTracking()
            .Where(favorite => favorite.UserId == userId)
            .Select(favorite => new FavoriteProductDto
            {
                Id = favorite.Product!.Id,
                Name = favorite.Product.Name,
                Thumbnail = favorite.Product.Thumbnail,
                BrandName = favorite.Product.Brand!.Name,
                MinPrice = favorite.Product.Variants.Any()
                    ? favorite.Product.Variants.Min(variant => variant.Price)
                    : 0
            })
            .ToListAsync(cancellationToken);

    public Task<Favorite?> GetAsync(string userId, int productId, CancellationToken cancellationToken = default)
        => _context.Favorites.FirstOrDefaultAsync(
            favorite => favorite.UserId == userId && favorite.ProductId == productId,
            cancellationToken);

    public Task AddAsync(Favorite favorite, CancellationToken cancellationToken = default)
        => _context.Favorites.AddAsync(favorite, cancellationToken).AsTask();

    public void Remove(Favorite favorite) => _context.Favorites.Remove(favorite);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => _context.SaveChangesAsync(cancellationToken);
}