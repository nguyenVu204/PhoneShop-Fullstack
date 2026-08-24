using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Repositories;

public interface IUserQueryRepository
{
    Task<AdminUserPageDto> GetPageAsync(string? search, int page, int limit, CancellationToken cancellationToken = default);
}