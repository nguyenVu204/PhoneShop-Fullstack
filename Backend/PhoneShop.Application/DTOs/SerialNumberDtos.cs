namespace PhoneShop.Application.DTOs;

public class AddSerialNumbersRequest
{
    public int VariantId { get; set; }
    public List<string> Imeis { get; set; } = new();
}

public class AvailableSerialDto
{
    public int Id { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
}