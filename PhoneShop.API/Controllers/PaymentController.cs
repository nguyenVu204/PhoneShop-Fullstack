using Microsoft.AspNetCore.Mvc;
using PhoneShop.API.Data;
using PhoneShop.API.Services.VnPay;
using Microsoft.EntityFrameworkCore;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;
        private readonly AppDbContext _context;

        public PaymentController(IVnPayService vnPayService, AppDbContext context)
        {
            _vnPayService = vnPayService;
            _context = context;
        }

        // 1. Tạo link thanh toán
        [HttpPost("create-payment-url")]
        public async Task<IActionResult> CreatePaymentUrl([FromBody] VnPayPaymentRequestModel model)
        {
            // Kiểm tra đơn hàng có tồn tại không
            var order = await _context.Orders.FindAsync(model.OrderId);
            if (order == null) return NotFound("Không tìm thấy đơn hàng");

            // Cập nhật số tiền chính xác từ DB để bảo mật (tránh hack giá ở Frontend)
            model.Amount = (double)order.TotalAmount;
            model.CreatedDate = DateTime.Now;

            var url = _vnPayService.CreatePaymentUrl(HttpContext, model);
            return Ok(new { url });
        }

        // 2. Xử lý kết quả trả về (Callback)
        [HttpGet("payment-callback")]
        public async Task<IActionResult> PaymentCallback()
        {
            var response = _vnPayService.PaymentExecute(Request.Query);

            if (response == null || response.VnPayResponseCode != "00")
            {
                return Ok(new { Success = false, Message = "Lỗi thanh toán: " + response.VnPayResponseCode });
            }

            // Thanh toán thành công -> Cập nhật Database
            var orderId = int.Parse(response.OrderId);
            var order = await _context.Orders.FindAsync(orderId);

            if (order != null)
            {
                order.PaymentStatus = "Paid";
                await _context.SaveChangesAsync();
            }

            return Ok(new { Success = true, Message = "Thanh toán thành công", Data = response });
        }
    }
}