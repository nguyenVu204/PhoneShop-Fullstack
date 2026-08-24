using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class SerialNumberRepository : ISerialNumberRepository
{
    private readonly AppDbContext _context;

    public SerialNumberRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<ProductVariant?> GetVariantAsync(int variantId, CancellationToken cancellationToken = default)
        => _context.ProductVariants.FirstOrDefaultAsync(variant => variant.Id == variantId, cancellationToken);

    public Task<bool> ExistsAsync(string serialNumber, CancellationToken cancellationToken = default)
        => _context.ProductSerialNumbers.AnyAsync(item => item.SerialNumber == serialNumber, cancellationToken);

    public Task AddAsync(ProductSerialNumber serialNumber, CancellationToken cancellationToken = default)
        => _context.ProductSerialNumbers.AddAsync(serialNumber, cancellationToken).AsTask();

    public Task<int> CountAvailableAsync(int variantId, CancellationToken cancellationToken = default)
        => _context.ProductSerialNumbers.CountAsync(item => item.ProductVariantId == variantId && item.Status == "Available", cancellationToken);

    public async Task<IReadOnlyList<AvailableSerialDto>> GetAvailableAsync(int variantId, CancellationToken cancellationToken = default)
        => await _context.ProductSerialNumbers.AsNoTracking()
            .Where(item => item.ProductVariantId == variantId && item.Status == "Available")
            .Select(item => new AvailableSerialDto { Id = item.Id, SerialNumber = item.SerialNumber })
            .ToListAsync(cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => _context.SaveChangesAsync(cancellationToken);
}