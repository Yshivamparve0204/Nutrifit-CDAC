public class User
{
    public int UserId { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }

    // 🔑 Forgot Password
    public string? ResetToken { get; set; }
    public DateTime? ResetTokenExpiry { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
