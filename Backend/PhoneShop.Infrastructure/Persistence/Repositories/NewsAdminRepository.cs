using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class NewsAdminRepository : INewsAdminRepository
{
    private readonly AppDbContext _context;

    public NewsAdminRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(CreateNewsDto request, string? authorId, CancellationToken cancellationToken = default)
    {
        var news = new News { Title = request.Title, Slug = request.Slug, Summary = request.Summary, Content = request.Content, Thumbnail = request.Thumbnail, Status = request.Status, RelatedProductId = request.RelatedProductId, AuthorId = authorId ?? string.Empty };
        foreach (var categoryId in request.CategoryIds) news.CategoryMappings.Add(new NewsCategoryMapping { CategoryId = categoryId });
        _context.News.Add(news);
        await _context.SaveChangesAsync(cancellationToken);
        return news.Id;
    }

    public async Task<bool> UpdateAsync(int id, CreateNewsDto request, CancellationToken cancellationToken = default)
    {
        var news = await _context.News.Include(item => item.CategoryMappings).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (news is null) return false;
        news.Title = request.Title; news.Slug = request.Slug; news.Summary = request.Summary; news.Content = request.Content; news.Thumbnail = request.Thumbnail; news.Status = request.Status; news.RelatedProductId = request.RelatedProductId; news.UpdatedAt = DateTime.Now;
        _context.NewsCategoryMappings.RemoveRange(news.CategoryMappings);
        foreach (var categoryId in request.CategoryIds) news.CategoryMappings.Add(new NewsCategoryMapping { CategoryId = categoryId });
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var news = await _context.News.FindAsync(new object[] { id }, cancellationToken);
        if (news is null) return false;
        _context.News.Remove(news);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<AdminNewsDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var news = await _context.News.AsNoTracking().Include(item => item.CategoryMappings).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        return news is null ? null : new AdminNewsDto { Id = news.Id, Title = news.Title, Slug = news.Slug, Summary = news.Summary, Content = news.Content, Thumbnail = news.Thumbnail, Status = news.Status, RelatedProductId = news.RelatedProductId, CategoryIds = news.CategoryMappings.Select(mapping => mapping.CategoryId).ToList() };
    }

    public async Task<IReadOnlyList<AdminNewsListItemDto>> GetListAsync(CancellationToken cancellationToken = default)
        => await _context.News.AsNoTracking().OrderByDescending(news => news.CreatedAt).Select(news => new AdminNewsListItemDto { Id = news.Id, Title = news.Title, Slug = news.Slug, Thumbnail = news.Thumbnail, CreatedAt = news.CreatedAt, ViewCount = news.ViewCount, Status = news.Status }).ToListAsync(cancellationToken);
}