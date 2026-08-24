using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Repositories;

public interface INewsCategoryRepository
{
    Task<IReadOnlyList<NewsCategoryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<NewsCategory?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> IsUsedAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(NewsCategory category, CancellationToken cancellationToken = default);
    void Remove(NewsCategory category);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}