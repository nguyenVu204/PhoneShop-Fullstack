namespace PhoneShop.Application.DTOs;

public class AdminUserItemDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
}

public class AdminUserPageDto
{
    public IReadOnlyList<AdminUserItemDto> Items { get; set; } = Array.Empty<AdminUserItemDto>();
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
}