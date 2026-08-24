using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _repository;

    public ReviewService(IReviewRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<ReviewDto>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
        => _repository.GetByProductAsync(productId, cancellationToken);

    public async Task<ReviewDto?> CreateAsync(CreateReviewRequest request, string userId, CancellationToken cancellationToken = default)
    {
        if (request.Rating < 1 || request.Rating > 5)
            return null;

        var review = new Review
        {
            ProductId = request.ProductId,
            Rating = request.Rating,
            Comment = request.Comment,
            UserId = userId,
            CreatedAt = DateTime.Now
        };

        await _repository.AddAsync(review, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return new ReviewDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
            UserFullName = await _repository.GetUserFullNameAsync(userId, cancellationToken)
        };
    }
}