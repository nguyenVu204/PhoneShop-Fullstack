using PhoneShop.API.Dtos;

namespace PhoneShop.Application.Interfaces.Services;

public interface IOrderCommandService
{
    Task<CreateOrderResult> CreateAsync(CreateOrderDto request, string? userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<AssignImeiResult> AssignImeiAsync(AssignImeiDto request, CancellationToken cancellationToken = default);
}

public class CreateOrderResult
{
    public bool Succeeded { get; init; }
    public string? Error { get; init; }
    public int OrderId { get; init; }
    public decimal Total { get; init; }
}

public class AssignImeiResult
{
    public bool Succeeded { get; init; }
    public bool NotFound { get; init; }
    public string? Error { get; init; }
    public string? SerialNumber { get; init; }
}