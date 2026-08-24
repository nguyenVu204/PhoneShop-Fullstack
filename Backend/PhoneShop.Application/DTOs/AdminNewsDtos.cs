namespace PhoneShop.Application.DTOs;

public class AdminNewsDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? Content { get; set; }
    public string? Thumbnail { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? RelatedProductId { get; set; }
    public IReadOnlyList<int> CategoryIds { get; set; } = Array.Empty<int>();
}

public class AdminNewsListItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Thumbnail { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ViewCount { get; set; }
    public string Status { get; set; } = string.Empty;
}