namespace PhoneShop.Application.Interfaces.Services;

public interface IOrderStatusService
{
    Task<bool> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default);
    Task<bool> UpdatePaymentStatusAsync(int id, string status, CancellationToken cancellationToken = default);
}