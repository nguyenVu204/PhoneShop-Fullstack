using Microsoft.AspNetCore.Mvc;
using PhoneShop.API.Services.VnPay;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;
        private readonly IPaymentOrderService _paymentOrderService;

        public PaymentController(IVnPayService vnPayService, IPaymentOrderService paymentOrderService)
        {
            _vnPayService = vnPayService;
            _paymentOrderService = paymentOrderService;
        }

        // Tạo link thanh toán
        [HttpPost("create-payment-url")]
        public async Task<IActionResult> CreatePaymentUrl([FromBody] VnPayPaymentRequestModel model)
        {
            // Kiểm tra đơn hàng có tồn tại không
            var totalAmount = await _paymentOrderService.GetTotalAmountAsync(model.OrderId);
            if (totalAmount is null) return NotFound("Không tìm thấy đơn hàng");

            // Cập nhật số tiền chính xác từ DB để bảo mật (tránh hack giá ở Frontend)
            model.Amount = (double)totalAmount.Value;
            model.CreatedDate = DateTime.Now;

            var url = _vnPayService.CreatePaymentUrl(HttpContext, model);
            return Ok(new { url });
        }

        // Xử lý kết quả trả về (Callback)
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
            await _paymentOrderService.MarkPaidAsync(orderId);

            return Ok(new { Success = true, Message = "Thanh toán thành công", Data = response });
        }
    }
}