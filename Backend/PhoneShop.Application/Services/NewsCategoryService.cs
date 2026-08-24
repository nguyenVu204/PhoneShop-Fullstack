using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class NewsCategoryService : INewsCategoryService
{
    private readonly INewsCategoryRepository _repository;

    public NewsCategoryService(INewsCategoryRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<NewsCategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
        => _repository.GetAllAsync(cancellationToken);

    public async Task<NewsCategory?> CreateAsync(NewsCategory category, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(category.Name))
            return null;

        if (string.IsNullOrEmpty(category.Slug))
            category.Slug = category.Name.ToLower().Replace(" ", "-");

        await _repository.AddAsync(category, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return category;
    }

    public async Task<bool> UpdateAsync(int id, NewsCategory category, CancellationToken cancellationToken = default)
    {
        var existingCategory = await _repository.GetByIdAsync(id, cancellationToken);
        if (existingCategory is null)
            return false;

        existingCategory.Name = category.Name;
        existingCategory.Slug = category.Slug;
        existingCategory.Description = category.Description;
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<NewsCategoryDeleteResult> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _repository.GetByIdAsync(id, cancellationToken);
        if (category is null)
            return NewsCategoryDeleteResult.NotFound;

        if (await _repository.IsUsedAsync(id, cancellationToken))
            return NewsCategoryDeleteResult.InUse;

        _repository.Remove(category);
        await _repository.SaveChangesAsync(cancellationToken);
        return NewsCategoryDeleteResult.Deleted;
    }
}