using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _context;

    public ReviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ReviewDto>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
        => await _context.Reviews.AsNoTracking().Where(review => review.ProductId == productId).OrderByDescending(review => review.CreatedAt)
            .Select(review => new ReviewDto { Id = review.Id, Rating = review.Rating, Comment = review.Comment, CreatedAt = review.CreatedAt, UserFullName = review.User!.FullName })
            .ToListAsync(cancellationToken);

    public Task AddAsync(Review review, CancellationToken cancellationToken = default)
        => _context.Reviews.AddAsync(review, cancellationToken).AsTask();

    public Task<string?> GetUserFullNameAsync(string userId, CancellationToken cancellationToken = default)
        => _context.Users.Where(user => user.Id == userId).Select(user => user.FullName).FirstOrDefaultAsync(cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => _context.SaveChangesAsync(cancellationToken);
}