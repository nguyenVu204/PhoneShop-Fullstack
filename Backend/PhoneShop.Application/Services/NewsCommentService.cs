using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class NewsCommentService : INewsCommentService
{
    private readonly INewsCommentRepository _repository;

    public NewsCommentService(INewsCommentRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<NewsCommentDto>> GetByNewsIdAsync(int newsId, CancellationToken cancellationToken = default)
        => _repository.GetByNewsIdAsync(newsId, cancellationToken);

    public async Task<bool> AddAsync(int newsId, string userId, AddNewsCommentRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Content) || !await _repository.NewsExistsAsync(newsId, cancellationToken))
            return false;
        await _repository.AddAsync(new NewsComment { NewsId = newsId, UserId = userId, Content = request.Content, CreatedAt = DateTime.Now }, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }
}