using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class NewsCategoryRepository : INewsCategoryRepository
{
    private readonly AppDbContext _context;

    public NewsCategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<NewsCategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.NewsCategories
            .AsNoTracking()
            .Select(category => new NewsCategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description
            })
            .ToListAsync(cancellationToken);

    public Task<NewsCategory?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => _context.NewsCategories.FirstOrDefaultAsync(category => category.Id == id, cancellationToken);

    public Task<bool> IsUsedAsync(int id, CancellationToken cancellationToken = default)
        => _context.NewsCategoryMappings.AnyAsync(mapping => mapping.CategoryId == id, cancellationToken);

    public Task AddAsync(NewsCategory category, CancellationToken cancellationToken = default)
        => _context.NewsCategories.AddAsync(category, cancellationToken).AsTask();

    public void Remove(NewsCategory category) => _context.NewsCategories.Remove(category);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => _context.SaveChangesAsync(cancellationToken);
}