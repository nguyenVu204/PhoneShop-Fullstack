using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Services;

public interface IReviewService
{
    Task<IReadOnlyList<ReviewDto>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<ReviewDto?> CreateAsync(CreateReviewRequest request, string userId, CancellationToken cancellationToken = default);
}