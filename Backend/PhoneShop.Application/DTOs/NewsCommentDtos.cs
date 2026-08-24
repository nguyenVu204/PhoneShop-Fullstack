namespace PhoneShop.Application.DTOs;

public class AddNewsCommentRequest
{
    public string Content { get; set; } = string.Empty;
}

public class NewsCommentDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}