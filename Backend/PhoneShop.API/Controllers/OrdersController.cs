using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;
using System.Security.Claims;
using System.Security.Claims;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderQueryService _orderQueryService;
        private readonly IOrderStatusService _orderStatusService;
        private readonly IOrderCommandService _orderCommandService;
        private readonly IOrderExportService _orderExportService;

        public OrdersController(IOrderQueryService orderQueryService, IOrderStatusService orderStatusService, IOrderCommandService orderCommandService, IOrderExportService orderExportService)
        {
            _orderQueryService = orderQueryService;
            _orderStatusService = orderStatusService;
            _orderCommandService = orderCommandService;
            _orderExportService = orderExportService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            try
            {
                var result = await _orderCommandService.CreateAsync(dto, userId);
                return result.Succeeded
                    ? Ok(new { Message = "Đặt hàng thành công", OrderId = result.OrderId, Total = result.Total })
                    : BadRequest(result.Error);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }

        // GET: api/orders/my-orders
        [HttpGet("my-orders")]
        [Authorize]
        public async Task<ActionResult<object>> GetMyOrders(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 5 // Mặc định lấy 5 đơn mỗi trang
        )
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _orderQueryService.GetMineAsync(userId, page, limit);

            return Ok(new
            {
                Items = result.Items,
                TotalPages = result.TotalPages,
                CurrentPage = page,
                TotalItems = result.TotalItems
            });
        }

        // GET: api/orders (Dành cho Admin)
        [HttpGet]
        [Authorize(Roles = "Admin")] // Chỉ Admin
        public async Task<ActionResult<object>> GetOrders(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10 
        )
        {
            var result = await _orderQueryService.GetAdminAsync(search, page, limit);

            return Ok(new
            {
                Items = result.Items,
                TotalPages = result.TotalPages,
                CurrentPage = page,
                TotalItems = result.TotalItems
            });
        }

        // GET: api/orders/5 (Lấy chi tiết 1 đơn hàng)
        [HttpGet("{id}")]
        [Authorize] // Bắt buộc đăng nhập
        public async Task<ActionResult<Order>> GetOrderById(int id)
        {
            // Lấy thông tin người đang đăng nhập
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var order = await _orderQueryService.GetByIdAsync(id);

            // Nếu không tìm thấy
            if (order == null)
            {
                return NotFound(new { Message = "Không tìm thấy đơn hàng này." });
            }

            // Nếu không phải Admin VÀ cũng không phải chủ đơn hàng
            if (userRole != "Admin" && order.UserId != userId)
            {
                return Forbid(); // Trả về lỗi 403 Forbidden
            }

            return Ok(order);
        }

        // --- API ADMIN: Cập nhật trạng thái đơn ---
        // PUT: api/orders/5/status
        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string newStatus)
        {
            return await _orderStatusService.UpdateStatusAsync(id, newStatus)
                ? Ok(new { Message = "Cập nhật trạng thái thành công" })
                : NotFound("Không tìm thấy đơn hàng");
        }

        // ========================================================
        // --- API ADMIN: XÓA ĐƠN HÀNG VÀ HOÀN LẠI TỒN KHO ---
        // ========================================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            try
            {
                return await _orderCommandService.DeleteAsync(id)
                    ? Ok(new { Message = "Đã xóa đơn hàng và hoàn lại tồn kho thành công." })
                    : NotFound("Không tìm thấy đơn hàng.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }

        // POST: api/orders/assign-imei
        [HttpPost("assign-imei")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignImeiToOrder([FromBody] AssignImeiDto dto)
        {
            var result = await _orderCommandService.AssignImeiAsync(dto);
            if (result.Succeeded)
                return Ok(new { Message = "Đã gán IMEI thành công", SerialNumber = result.SerialNumber });
            if (result.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        // PUT: api/orders/{id}/payment-status
        [HttpPut("{id}/payment-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] string newStatus)
        {
            return await _orderStatusService.UpdatePaymentStatusAsync(id, newStatus)
                ? Ok(new { Message = "Cập nhật trạng thái thanh toán thành công" })
                : NotFound();
        }

        // GET: api/orders/export
        [HttpGet("export")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportOrders()
        {
            var file = await _orderExportService.ExportAsync();
            return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Orders.xlsx");
        }
    }
}