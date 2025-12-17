using System.ComponentModel.DataAnnotations.Schema;

namespace PhoneShop.API.Models
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.Now;

        
        public string? UserId { get; set; } = string.Empty;
        public AppUser? User { get; set; }
        // ---------------------

        //thông tin người nhận (vì có thể mua hộ người khác)
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public string PaymentMethod { get; set; } = "COD";
        public string PaymentStatus { get; set; } = "Unpaid";

        public List<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}