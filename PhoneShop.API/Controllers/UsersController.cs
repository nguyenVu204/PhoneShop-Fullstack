using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data; // Nhớ using namespace chứa AppDbContext
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly AppDbContext _context; // Thêm DbContext để query linh hoạt hơn

        public UsersController(UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager, AppDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        // 1. Lấy danh sách User (Có Phân trang & Tìm kiếm)
        [HttpGet]
        public async Task<ActionResult<object>> GetUsers(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10
        )
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search) || u.PhoneNumber.Contains(search));
            }

            query = query.OrderBy(u => u.Email);

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

            // Lấy danh sách User trước
            var users = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.LockoutEnd
                })
                .ToListAsync();

            // Lấy Role cho từng User (Cách này hơi thủ công nhưng an toàn với Identity)
            var result = new List<object>();
            foreach (var u in users)
            {
                var userEntity = await _userManager.FindByIdAsync(u.Id);
                var roles = await _userManager.GetRolesAsync(userEntity);

                result.Add(new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.LockoutEnd,
                    Roles = roles // Trả về danh sách quyền (ví dụ: ["Admin"])
                });
            }

            return Ok(new
            {
                Items = result,
                TotalPages = totalPages,
                CurrentPage = page,
                TotalItems = totalItems
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

        // 4. Phân quyền (Giữ nguyên logic cũ nếu bạn cần)
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