using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using System.Text;
using System.Text.Json;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;

        public ChatController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
            _httpClient = new HttpClient();
        }

        public class ChatRequest
        {
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> AskAi([FromBody] ChatRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Message))
                    return BadRequest("Vui lòng nhập câu hỏi.");

                var apiKey = _config["Groq:ApiKey"];

                if (string.IsNullOrEmpty(apiKey))
                    return StatusCode(500, "Thiếu API Key");

                // lấy sản phẩm

                var products = await _context.Products
                    .Include(p => p.Brand)
                    .Include(p => p.Variants)
                    .Where(p =>
                        p.Name.Contains(request.Message) ||
                        p.Brand.Name.Contains(request.Message))
                    .Take(5)
                    .Select(p => new
                    {
                        p.Id,
                        TenMay = p.Name,
                        Hang = p.Brand.Name,
                        GiaThapNhat = p.Variants.Any()
                            ? p.Variants.Min(v => v.Price)
                            : 0,
                        CauHinh = $"{p.Chip}, {p.Screen}, {p.Battery}"
                    })
                    .ToListAsync();

                // fallback
                if (!products.Any())
                {
                    products = await _context.Products
                        .Include(p => p.Brand)
                        .Include(p => p.Variants)
                        .Take(5)
                        .Select(p => new
                        {
                            p.Id,
                            TenMay = p.Name,
                            Hang = p.Brand.Name,
                            GiaThapNhat = p.Variants.Any()
                                ? p.Variants.Min(v => v.Price)
                                : 0,
                            CauHinh = $"{p.Chip}, {p.Screen}, {p.Battery}"
                        })
                        .ToListAsync();
                }

                //BUILD CONTEXT

                var contextBuilder = new StringBuilder();

                foreach (var p in products)
                {
                    contextBuilder.AppendLine(
                        $"- [{p.TenMay}](/product/{p.Id}) ({p.Hang}) | Giá: {p.GiaThapNhat:N0} VNĐ | {p.CauHinh}"
                    );
                }

                //SYSTEM PROMPT

                string systemPrompt = $@"
Bạn là nhân viên tư vấn bán điện thoại của TechMobile.

DANH SÁCH SẢN PHẨM:
{contextBuilder}

QUY TẮC:
- Trả lời ngắn gọn, dễ hiểu.
- Dùng emoji nhẹ 😊📱
- KHÔNG bịa sản phẩm ngoài danh sách.
- GIỮ NGUYÊN format link markdown.
- Không dùng markdown in đậm (**).
- Có thể gợi ý thêm sản phẩm tương tự.

KHÁCH HỎI:
{request.Message}
";

                // CALL API

                _httpClient.DefaultRequestHeaders.Clear();

                _httpClient.DefaultRequestHeaders.Add(
                    "Authorization",
                    $"Bearer {apiKey}"
                );

                var requestBody = new
                {
                    model = "llama-3.1-8b-instant",

                    max_tokens = 200,

                    temperature = 0.5,

                    messages = new[]
                    {
                        new
                        {
                            role = "system",
                            content = systemPrompt
                        },
                        new
                        {
                            role = "user",
                            content = request.Message
                        }
                    }
                };

                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(
                    "https://api.groq.com/openai/v1/chat/completions",
                    jsonContent
                );

                var responseString =
                    await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode(
                        500,
                        "Groq error: " + responseString
                    );
                }

                using var doc =
                    JsonDocument.Parse(responseString);

                var reply = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return Ok(new { reply });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    "Lỗi server: " + ex.Message
                );
            }
        }
    }
}

