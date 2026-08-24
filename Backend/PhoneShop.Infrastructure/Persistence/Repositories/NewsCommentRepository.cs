using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class NewsCommentRepository : INewsCommentRepository
{
    private readonly AppDbContext _context;

    public NewsCommentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<NewsCommentDto>> GetByNewsIdAsync(int newsId, CancellationToken cancellationToken = default)
        => await _context.NewsComments.AsNoTracking().Where(comment => comment.NewsId == newsId).OrderByDescending(comment => comment.CreatedAt)
            .Select(comment => new NewsCommentDto
            {
                Id = comment.Id, Content = comment.Content, CreatedAt = comment.CreatedAt, UserId = comment.UserId,
                UserName = _context.Users.Where(user => user.Id == comment.UserId).Select(user => user.FullName ?? user.UserName).FirstOrDefault() ?? "Thành viên ẩn danh"
            }).ToListAsync(cancellationToken);

    public Task<bool> NewsExistsAsync(int newsId, CancellationToken cancellationToken = default)
        => _context.News.AnyAsync(news => news.Id == newsId, cancellationToken);

    public Task AddAsync(NewsComment comment, CancellationToken cancellationToken = default)
        => _context.NewsComments.AddAsync(comment, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => _context.SaveChangesAsync(cancellationToken);
}