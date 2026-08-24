namespace PhoneShop.Application.Interfaces.Services;

public interface IChatProductService
{
    Task<IReadOnlyList<ChatProductContext>> GetProductsAsync(string message, CancellationToken cancellationToken = default);
}

public class ChatProductContext
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public decimal LowestPrice { get; set; }
    public string Configuration { get; set; } = string.Empty;
}