namespace PhoneShop.API.Models
{
    public class Brand
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Apple, Samsung
        public string? LogoUrl { get; set; }

        // Quan hệ 1-n: 1 Hãng có nhiều điện thoại
        public List<Product> Products { get; set; } = new List<Product>();
    }
}