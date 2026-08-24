using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Repositories;

namespace PhoneShop.Infrastructure.Persistence.Repositories;

public class UserQueryRepository : IUserQueryRepository
{
    private readonly AppDbContext _context;

    public UserQueryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AdminUserPageDto> GetPageAsync(string? search, int page, int limit, CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(search))
            query = query.Where(user => user.FullName.Contains(search) || user.Email!.Contains(search) || user.PhoneNumber!.Contains(search));

        query = query.OrderBy(user => user.Email);
        var totalItems = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * limit).Take(limit)
            .Select(user => new AdminUserItemDto
            {
                Id = user.Id, FullName = user.FullName, Email = user.Email,
                PhoneNumber = user.PhoneNumber, LockoutEnd = user.LockoutEnd
            }).ToListAsync(cancellationToken);

        return new AdminUserPageDto
        {
            Items = items,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)limit)
        };
    }
}