namespace PhoneShop.Application.Interfaces.Services;

public interface IProductImportService
{
    Task<int> ImportAsync(Stream stream, CancellationToken cancellationToken = default);
}