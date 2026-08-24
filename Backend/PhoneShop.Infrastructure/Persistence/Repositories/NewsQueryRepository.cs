using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class NewsQueryRepository : INewsQueryRepository
{
    private readonly AppDbContext _context;

    public NewsQueryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<NewsListItemDto> Items, int TotalItems)> GetPublishedAsync(int page, int limit, string? search, CancellationToken cancellationToken = default)
    {
        var query = _context.News.AsNoTracking().Where(news => news.Status == "Published");
        if (!string.IsNullOrEmpty(search)) query = query.Where(news => news.Title.Contains(search));
        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderByDescending(news => news.CreatedAt).Skip((page - 1) * limit).Take(limit)
            .Select(news => new NewsListItemDto
            {
                Id = news.Id, Title = news.Title, Slug = news.Slug, Summary = news.Summary,
                Thumbnail = news.Thumbnail, CreatedAt = news.CreatedAt, ViewCount = news.ViewCount,
                Categories = news.CategoryMappings.Select(mapping => mapping.Category!.Name).ToList()
            }).ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<NewsDetailDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var news = await _context.News.Include(item => item.CategoryMappings).ThenInclude(mapping => mapping.Category)
            .Include(item => item.RelatedProduct).FirstOrDefaultAsync(item => item.Slug == slug && item.Status == "Published", cancellationToken);
        if (news is null) return null;
        news.ViewCount++;
        await _context.SaveChangesAsync(cancellationToken);
        return new NewsDetailDto
        {
            Id = news.Id, Title = news.Title, Content = news.Content, Thumbnail = news.Thumbnail,
            CreatedAt = news.CreatedAt, ViewCount = news.ViewCount, AuthorId = news.AuthorId,
            Categories = news.CategoryMappings.Select(mapping => new NewsCategoryItemDto { Id = mapping.Category!.Id, Name = mapping.Category.Name }).ToList(),
            RelatedProduct = news.RelatedProduct is null ? null : new NewsRelatedProductDto { Id = news.RelatedProduct.Id, Name = news.RelatedProduct.Name, Thumbnail = news.RelatedProduct.Thumbnail }
        };
    }
}