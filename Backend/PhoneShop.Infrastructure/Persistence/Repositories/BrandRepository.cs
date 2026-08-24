using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class BrandRepository : IBrandRepository
{
    private readonly AppDbContext _context;

    public BrandRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Brand>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Brands.AsNoTracking().ToListAsync(cancellationToken);

    public Task<Brand?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => _context.Brands.FirstOrDefaultAsync(brand => brand.Id == id, cancellationToken);

    public async Task<BrandProductsDto?> GetProductsAsync(int id, CancellationToken cancellationToken = default)
    {
        var brand = await _context.Brands.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (brand is null)
            return null;

        var products = await _context.Products
            .AsNoTracking()
            .Where(product => product.BrandId == id)
            .Select(product => new BrandProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Thumbnail = product.Thumbnail,
                TotalStock = product.Variants.Sum(variant => variant.StockQuantity),
                TotalSold = _context.OrderDetails
                    .Where(detail => detail.ProductVariant!.ProductId == product.Id && detail.Order!.Status != "Cancelled")
                    .Sum(detail => (int?)detail.Quantity) ?? 0,
                Variants = product.Variants.Select(variant => new BrandVariantDto
                {
                    Id = variant.Id,
                    Color = variant.Color,
                    Ram = variant.Ram,
                    Rom = variant.Rom,
                    Price = variant.Price,
                    StockQuantity = variant.StockQuantity,
                    ImageUrl = variant.ImageUrl
                }).ToList(),
                ExportHistory = _context.OrderDetails
                    .Where(detail => detail.ProductVariant!.ProductId == product.Id && detail.Order!.Status != "Cancelled")
                    .OrderByDescending(detail => detail.Order!.OrderDate)
                    .Select(detail => new ExportHistoryDto
                    {
                        Date = detail.Order!.OrderDate.ToString("dd/MM/yyyy HH:mm"),
                        Quantity = detail.Quantity,
                        CustomerName = detail.Order.CustomerName,
                        VariantInfo = detail.ProductVariant!.Color + " - " + detail.ProductVariant.Rom,
                        SerialNumbers = detail.SerialNumber
                    })
                    .Take(15)
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        return new BrandProductsDto { BrandName = brand.Name, Products = products };
    }

    public Task<bool> HasProductsAsync(int id, CancellationToken cancellationToken = default)
        => _context.Products.AnyAsync(product => product.BrandId == id, cancellationToken);

    public Task AddAsync(Brand brand, CancellationToken cancellationToken = default)
        => _context.Brands.AddAsync(brand, cancellationToken).AsTask();

    public void Remove(Brand brand) => _context.Brands.Remove(brand);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => _context.SaveChangesAsync(cancellationToken);
}