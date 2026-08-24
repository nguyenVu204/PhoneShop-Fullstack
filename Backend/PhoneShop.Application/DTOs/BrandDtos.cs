namespace PhoneShop.Application.DTOs;

public class BrandProductsDto
{
    public string BrandName { get; set; } = string.Empty;
    public IReadOnlyList<BrandProductDto> Products { get; set; } = Array.Empty<BrandProductDto>();
}

public class BrandProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Thumbnail { get; set; }
    public int TotalStock { get; set; }
    public int TotalSold { get; set; }
    public IReadOnlyList<BrandVariantDto> Variants { get; set; } = Array.Empty<BrandVariantDto>();
    public IReadOnlyList<ExportHistoryDto> ExportHistory { get; set; } = Array.Empty<ExportHistoryDto>();
}

public class BrandVariantDto
{
    public int Id { get; set; }
    public string Color { get; set; } = string.Empty;
    public string Ram { get; set; } = string.Empty;
    public string Rom { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
}

public class ExportHistoryDto
{
    public string Date { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string VariantInfo { get; set; } = string.Empty;
    public string? SerialNumbers { get; set; }
}