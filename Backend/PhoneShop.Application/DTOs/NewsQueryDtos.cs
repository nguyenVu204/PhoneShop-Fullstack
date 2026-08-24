namespace PhoneShop.Application.DTOs;

public class NewsListItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? Thumbnail { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ViewCount { get; set; }
    public IReadOnlyList<string> Categories { get; set; } = Array.Empty<string>();
}

public class NewsDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Thumbnail { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ViewCount { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public IReadOnlyList<NewsCategoryItemDto> Categories { get; set; } = Array.Empty<NewsCategoryItemDto>();
    public NewsRelatedProductDto? RelatedProduct { get; set; }
}

public class NewsCategoryItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class NewsRelatedProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Thumbnail { get; set; }
}