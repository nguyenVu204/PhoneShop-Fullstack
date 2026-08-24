namespace PhoneShop.Application.Interfaces.Services;

public interface IPaymentOrderService
{
    Task<decimal?> GetTotalAmountAsync(int orderId, CancellationToken cancellationToken = default);
    Task<bool> MarkPaidAsync(int orderId, CancellationToken cancellationToken = default);
}