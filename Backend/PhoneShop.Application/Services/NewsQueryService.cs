using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class NewsQueryService : INewsQueryService
{
    private readonly INewsQueryRepository _repository;

    public NewsQueryService(INewsQueryRepository repository)
    {
        _repository = repository;
    }

    public Task<(IReadOnlyList<NewsListItemDto> Items, int TotalItems)> GetPublishedAsync(int page, int limit, string? search, CancellationToken cancellationToken = default)
        => _repository.GetPublishedAsync(page, limit, search, cancellationToken);

    public Task<NewsDetailDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
        => _repository.GetBySlugAsync(slug, cancellationToken);
}