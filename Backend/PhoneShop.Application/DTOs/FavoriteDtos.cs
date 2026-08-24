namespace PhoneShop.Application.DTOs;

public class FavoriteProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Thumbnail { get; set; }
    public string? BrandName { get; set; }
    public decimal MinPrice { get; set; }
}