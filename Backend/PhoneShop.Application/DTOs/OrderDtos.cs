namespace PhoneShop.API.Dtos
{
    // Dữ liệu Frontend gửi lên
    public class CreateOrderDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;


        // Danh sách sản phẩm muốn mua
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
    }

    public class CartItemDto
    {
        public int VariantId { get; set; }
        public int Quantity { get; set; }
    }
}