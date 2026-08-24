using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Services;

public interface INewsCommentService
{
    Task<IReadOnlyList<NewsCommentDto>> GetByNewsIdAsync(int newsId, CancellationToken cancellationToken = default);
    Task<bool> AddAsync(int newsId, string userId, AddNewsCommentRequest request, CancellationToken cancellationToken = default);
}