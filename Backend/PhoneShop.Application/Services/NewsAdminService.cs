using PhoneShop.API.Dtos;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Application.Services;

public class NewsAdminService : INewsAdminService
{
    private readonly PhoneShop.Application.Interfaces.Repositories.INewsAdminRepository _repository;

    public NewsAdminService(PhoneShop.Application.Interfaces.Repositories.INewsAdminRepository repository)
    {
        _repository = repository;
    }

    public Task<int> CreateAsync(CreateNewsDto request, string? authorId, CancellationToken cancellationToken = default)
        => _repository.CreateAsync(request, authorId, cancellationToken);

    public Task<bool> UpdateAsync(int id, CreateNewsDto request, CancellationToken cancellationToken = default)
        => _repository.UpdateAsync(id, request, cancellationToken);

    public Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    public Task<AdminNewsDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);

    public Task<IReadOnlyList<AdminNewsListItemDto>> GetListAsync(CancellationToken cancellationToken = default)
        => _repository.GetListAsync(cancellationToken);
}