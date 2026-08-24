using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IUserQueryService _userQueryService;

        public UsersController(UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager, IUserQueryService userQueryService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _userQueryService = userQueryService;
        }

        // 1. Lấy danh sách User (Có Phân trang & Tìm kiếm)
        [HttpGet]
        public async Task<ActionResult<object>> GetUsers(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10
        )
        {
            var pageResult = await _userQueryService.GetPageAsync(search, page, limit);

            // Lấy Role cho từng User (Cách này hơi thủ công nhưng an toàn với Identity)
            var result = new List<object>();
            foreach (var u in pageResult.Items)
            {
                var userEntity = await _userManager.FindByIdAsync(u.Id);
                var roles = userEntity is null ? Array.Empty<string>() : await _userManager.GetRolesAsync(userEntity);

                result.Add(new
                {
                    u.Id, u.FullName, u.Email, u.PhoneNumber, u.LockoutEnd,
                    Roles = roles // Trả về danh sách quyền (ví dụ: ["Admin"])
                });
            }

            return Ok(new
            {
                Items = result,
                TotalPages = pageResult.TotalPages,
                CurrentPage = page,
                TotalItems = pageResult.TotalItems
            });
        }

        // 2. Thêm API Cập nhật thông tin User (PUT)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("User không tồn tại");

            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;

            await _userManager.UpdateAsync(user);
            return Ok(new { Message = "Cập nhật thông tin thành công" });
        }

        // 2. Khóa / Mở khóa tài khoản (API Mới)
        [HttpPost("{id}/lock")]
        public async Task<IActionResult> ToggleLockUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("User không tồn tại");

            // Kiểm tra: Nếu đang bị khóa (LockoutEnd nằm trong tương lai) -> Mở khóa
            if (user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.Now)
            {
                user.LockoutEnd = null; // Mở khóa
                await _userManager.UpdateAsync(user);
                return Ok(new { Message = "Đã mở khóa tài khoản thành công" });
            }
            else
            {
                // Nếu đang hoạt động -> Khóa 100 năm
                user.LockoutEnd = DateTimeOffset.Now.AddYears(100);
                await _userManager.UpdateAsync(user);
                return Ok(new { Message = "Đã khóa tài khoản thành công" });
            }
        }

        // 3. Xóa User
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("User không tồn tại");

            // Xóa user (UserManager sẽ tự xử lý xóa các liên kết Role, nhưng Order/Review cần chú ý Cascade Delete ở DB)
            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded) return BadRequest("Lỗi khi xóa người dùng");

            return Ok(new { Message = "Đã xóa người dùng thành công" });
        }

        // 4. Phân quyền
        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto dto)
        {
            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user == null) return NotFound("User không tồn tại");

            if (!await _roleManager.RoleExistsAsync(dto.RoleName))
                return BadRequest("Role không hợp lệ");

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, dto.RoleName);

            return Ok(new { Message = $"Đã cập nhật quyền thành {dto.RoleName}" });
        }

        
    }
}