namespace PhoneShop.Application.Interfaces.Services;

public interface IProductExportService
{
    Task<byte[]> ExportAsync(CancellationToken cancellationToken = default);
}