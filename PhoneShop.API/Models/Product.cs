namespace PhoneShop.API.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // iPhone 15 Pro Max
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public int? BrandId { get; set; }
        public Brand? Brand { get; set; } // Khóa ngoại

        // Quan hệ 1-n: 1 Sản phẩm có nhiều biến thể (Màu, RAM)
        public List<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    }
}