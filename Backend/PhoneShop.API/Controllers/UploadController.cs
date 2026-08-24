using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "Admin")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public UploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            // 1. Kiểm tra file có hợp lệ không
            if (file == null || file.Length == 0)
                return BadRequest("Vui lòng chọn một file ảnh.");

            // Kiểm tra đuôi file (chỉ cho phép ảnh)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest("Chỉ cho phép upload các định dạng ảnh: .jpg, .png, .gif, .webp");

            // 2. Tạo đường dẫn lưu file
            // Đường dẫn gốc tới thư mục wwwroot
            string webRootPath = _environment.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                // Fallback nếu không tìm thấy wwwroot (thường xảy ra ở môi trường dev)
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            string uploadFolderPath = Path.Combine(webRootPath, "uploads");

            // Tạo thư mục nếu chưa tồn tại
            if (!Directory.Exists(uploadFolderPath))
                Directory.CreateDirectory(uploadFolderPath);

            // 3. Tạo tên file duy nhất (để tránh bị trùng đè file cũ)
            // Ví dụ: ảnh-của-tôi.jpg -> 550c8618-c701-4764-a6e1-23456789_ảnh-của-tôi.jpg
            string uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            string filePath = Path.Combine(uploadFolderPath, uniqueFileName);

            // 4. Lưu file vào ổ cứng server
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // 5. Tạo URL công khai để trả về cho Frontend
            // Ví dụ: https://localhost:7000/uploads/tên-file-vừa-tạo.jpg
            string fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}";

            return Ok(new { url = fileUrl });
        }
    }
}