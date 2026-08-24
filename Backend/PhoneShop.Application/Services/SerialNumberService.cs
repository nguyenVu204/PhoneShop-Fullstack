using PhoneShop.API.Models;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class SerialNumberService : ISerialNumberService
{
    private readonly ISerialNumberRepository _repository;

    public SerialNumberService(ISerialNumberRepository repository)
    {
        _repository = repository;
    }

    public async Task<(bool Found, int Added, int Stock)> AddRangeAsync(AddSerialNumbersRequest request, CancellationToken cancellationToken = default)
    {
        var variant = await _repository.GetVariantAsync(request.VariantId, cancellationToken);
        if (variant is null) return (false, 0, 0);

        var added = 0;
        foreach (var imei in request.Imeis)
        {
            if (await _repository.ExistsAsync(imei, cancellationToken)) continue;
            await _repository.AddAsync(new ProductSerialNumber
            {
                SerialNumber = imei,
                ProductVariantId = request.VariantId,
                Status = "Available",
                CreatedAt = DateTime.Now
            }, cancellationToken);
            added++;
        }

        await _repository.SaveChangesAsync(cancellationToken);
        var stock = await _repository.CountAvailableAsync(request.VariantId, cancellationToken);
        variant.StockQuantity = stock;
        await _repository.SaveChangesAsync(cancellationToken);
        return (true, added, stock);
    }

    public Task<IReadOnlyList<AvailableSerialDto>> GetAvailableAsync(int variantId, CancellationToken cancellationToken = default)
        => _repository.GetAvailableAsync(variantId, cancellationToken);
}