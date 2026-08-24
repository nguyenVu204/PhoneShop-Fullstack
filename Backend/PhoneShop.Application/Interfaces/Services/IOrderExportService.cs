namespace PhoneShop.Application.Interfaces.Services;

public interface IOrderExportService
{
    Task<byte[]> ExportAsync(CancellationToken cancellationToken = default);
}