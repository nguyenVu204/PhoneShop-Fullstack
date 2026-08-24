using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Services;

public interface IUserQueryService
{
    Task<AdminUserPageDto> GetPageAsync(string? search, int page, int limit, CancellationToken cancellationToken = default);
}