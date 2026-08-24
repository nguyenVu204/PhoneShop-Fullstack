using Microsoft.AspNetCore.Identity;

namespace PhoneShop.API.Models
{
    // Kế thừa IdentityUser để có sẵn: Id, UserName, Email, PasswordHash...
    public class AppUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public string? Address { get; set; }
    }
}