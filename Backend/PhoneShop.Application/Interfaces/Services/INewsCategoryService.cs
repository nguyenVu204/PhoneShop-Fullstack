using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Services;

public interface INewsCategoryService
{
    Task<IReadOnlyList<NewsCategoryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<NewsCategory?> CreateAsync(NewsCategory category, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, NewsCategory category, CancellationToken cancellationToken = default);
    Task<NewsCategoryDeleteResult> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

public enum NewsCategoryDeleteResult
{
    NotFound,
    InUse,
    Deleted
}