using Microsoft.AspNetCore.Mvc;
using PhoneShop.Application.Interfaces.Services;
using System.Text;
using System.Text.Json;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly IChatProductService _chatProductService;

        public ChatController(IConfiguration config, IChatProductService chatProductService)
        {
            _config = config;
            _httpClient = new HttpClient();
            _chatProductService = chatProductService;
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

                var products = await _chatProductService.GetProductsAsync(request.Message);

                //BUILD CONTEXT

                var contextBuilder = new StringBuilder();

                foreach (var p in products)
                {
                    contextBuilder.AppendLine(
                        $"- [{p.Name}](/product/{p.Id}) ({p.Brand}) | Giá: {p.LowestPrice:N0} VNĐ | {p.Configuration}"
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
                    model = "openai/gpt-oss-20b",

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

