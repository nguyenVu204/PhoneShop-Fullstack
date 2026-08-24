using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhoneShop.Application.DTOs;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SerialNumbersController : ControllerBase
    {
        private readonly ISerialNumberService _serialNumberService;

        public SerialNumbersController(ISerialNumberService serialNumberService)
        {
            _serialNumberService = serialNumberService;
        }

        [HttpPost("add-range")]
        public async Task<IActionResult> AddSerialNumbers([FromBody] AddSerialNumbersRequest dto)
        {
            var result = await _serialNumberService.AddRangeAsync(dto);
            if (!result.Found) return NotFound();
            return Ok(new { Message = $"Đã thêm {result.Added} IMEI. Tồn kho hiện tại: {result.Stock}" });
        }

        // 2. Lấy danh sách IMEI chưa bán của 1 biến thể (Để Admin chọn khi giao hàng)
        [HttpGet("available/{variantId}")]
        public async Task<IActionResult> GetAvailableSerials(int variantId)
        {
            return Ok(await _serialNumberService.GetAvailableAsync(variantId));
        }
    }
}
