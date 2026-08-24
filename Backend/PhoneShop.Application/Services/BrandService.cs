using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class BrandService : IBrandService
{
    private readonly IBrandRepository _repository;

    public BrandService(IBrandRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<Brand>> GetAllAsync(CancellationToken cancellationToken = default)
        => _repository.GetAllAsync(cancellationToken);

    public Task<BrandProductsDto?> GetProductsAsync(int id, CancellationToken cancellationToken = default)
        => _repository.GetProductsAsync(id, cancellationToken);

    public async Task<Brand?> CreateAsync(Brand brand, CancellationToken cancellationToken = default)
    {
        await _repository.AddAsync(brand, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return brand;
    }

    public async Task<bool> UpdateAsync(int id, Brand brand, CancellationToken cancellationToken = default)
    {
        if (id != brand.Id)
            return false;

        var existingBrand = await _repository.GetByIdAsync(id, cancellationToken);
        if (existingBrand is null)
            return false;

        existingBrand.Name = brand.Name;
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<BrandDeleteResult> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var brand = await _repository.GetByIdAsync(id, cancellationToken);
        if (brand is null)
            return BrandDeleteResult.NotFound;

        if (await _repository.HasProductsAsync(id, cancellationToken))
            return BrandDeleteResult.HasProducts;

        _repository.Remove(brand);
        await _repository.SaveChangesAsync(cancellationToken);
        return BrandDeleteResult.Deleted;
    }
}