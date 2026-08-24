namespace PhoneShop.Application.DTOs;

public class InventoryItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime? LastSoldDateValue { get; set; }
    public string LastSoldDate { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}