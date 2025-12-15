namespace PhoneShop.API.Dtos
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public IList<string> Roles { get; set; } = new List<string>(); // Danh sách quyền (VD: ["Admin", "Customer"])
    }

    // DTO để hứng dữ liệu đổi quyền
    public class AssignRoleDto
    {
        public string UserId { get; set; }
        public string RoleName { get; set; } // "Admin" hoặc "Customer"
    }
    public class UpdateUserDto
    {
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
    }
}