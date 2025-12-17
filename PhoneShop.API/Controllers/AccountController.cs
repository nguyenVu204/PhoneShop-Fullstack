using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _configuration;

        public AccountController(UserManager<AppUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        // POST: api/account/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // Kiểm tra email tồn tại
            var userExists = await _userManager.FindByEmailAsync(dto.Email);
            if (userExists != null)
                return BadRequest("Email này đã được sử dụng!");

            // Tạo User mới
            var newUser = new AppUser
            {
                FullName = dto.FullName,
                Email = dto.Email,
                UserName = dto.Email // Lấy email làm username
            };

            var result = await _userManager.CreateAsync(newUser, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { Message = "Đăng ký thành công!" });
        }

        // POST: api/account/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // Tìm user theo email
            var user = await _userManager.FindByEmailAsync(dto.Email);
            
            // Kiểm tra password
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                return Unauthorized("Email hoặc mật khẩu không đúng.");
            }

            // Nếu đúng -> Tạo JWT Token
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id), // Lưu UserID vào token
                new Claim("fullName", user.FullName), // Lưu thêm tên để hiện lên Header
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var userRoles = await _userManager.GetRolesAsync(user);
            foreach (var role in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddHours(3), // Token 3 tiếng
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Expiration = token.ValidTo
            });
        }
        // PUT: api/account/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            // Lấy User hiện tại từ Token
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Cập nhật thông tin
            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;

            // Lưu vào Database
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest("Lỗi cập nhật thông tin.");
            }

            // Trả về thông tin mới nhất để Frontend cập nhật lại Store
            return Ok(new
            {
                Message = "Cập nhật thành công",
                User = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.PhoneNumber,
                    Roles = await _userManager.GetRolesAsync(user)
                }
            });
        }
    }
}