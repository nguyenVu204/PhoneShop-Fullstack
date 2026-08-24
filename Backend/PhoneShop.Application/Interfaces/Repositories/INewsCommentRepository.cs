using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Repositories;

public interface INewsCommentRepository
{
    Task<IReadOnlyList<NewsCommentDto>> GetByNewsIdAsync(int newsId, CancellationToken cancellationToken = default);
    Task<bool> NewsExistsAsync(int newsId, CancellationToken cancellationToken = default);
    Task AddAsync(NewsComment comment, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}