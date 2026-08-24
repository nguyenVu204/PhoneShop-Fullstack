using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class UserQueryService : IUserQueryService
{
    private readonly IUserQueryRepository _repository;

    public UserQueryService(IUserQueryRepository repository)
    {
        _repository = repository;
    }

    public Task<AdminUserPageDto> GetPageAsync(string? search, int page, int limit, CancellationToken cancellationToken = default)
        => _repository.GetPageAsync(search, page, limit, cancellationToken);
}