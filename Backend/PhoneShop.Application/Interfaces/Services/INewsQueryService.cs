using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Services;

public interface INewsQueryService
{
    Task<(IReadOnlyList<NewsListItemDto> Items, int TotalItems)> GetPublishedAsync(int page, int limit, string? search, CancellationToken cancellationToken = default);
    Task<NewsDetailDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
}