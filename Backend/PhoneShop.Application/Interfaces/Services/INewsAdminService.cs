using PhoneShop.API.Dtos;
using PhoneShop.Application.DTOs;

namespace PhoneShop.Application.Interfaces.Services;

public interface INewsAdminService
{
    Task<int> CreateAsync(CreateNewsDto request, string? authorId, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, CreateNewsDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<AdminNewsDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdminNewsListItemDto>> GetListAsync(CancellationToken cancellationToken = default);
}