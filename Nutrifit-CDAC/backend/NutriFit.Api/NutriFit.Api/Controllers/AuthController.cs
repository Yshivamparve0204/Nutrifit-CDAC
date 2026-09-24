using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Security.Cryptography;
using System.Net;
using System.Net.Mail;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // =========================
    // ✅ USER REGISTER (PUBLIC)
    // =========================
    [HttpPost("register-user")]
    public IActionResult RegisterUser(RegisterDto dto)
    {
        if (dto.Password != dto.ConfirmPassword)
            return BadRequest("Password and Confirm Password do not match.");

        if (_db.Users.Any(x => x.Email == dto.Email))
            return BadRequest("User already exists");

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Users.Add(user);
        _db.SaveChanges();

        return Ok("User registered successfully");
    }

    // ==================================
    // ✅ ADMIN REGISTER (SECRET KEY ONLY)
    // ==================================
    [HttpPost("register-admin")]
    public IActionResult RegisterAdmin(AdminRegisterDto dto)
    {
        if (dto.Password != dto.ConfirmPassword)
            return BadRequest("Password and Confirm Password do not match.");

        var secretFromConfig = _config["AdminSettings:SecretKey"];

        if (dto.SecretKey != secretFromConfig)
            return Unauthorized("Invalid admin secret key");

        if (_db.Admins.Any(x => x.Email == dto.Email))
            return BadRequest("Admin already exists");

        var admin = new Admin
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Admins.Add(admin);
        _db.SaveChanges();

        return Ok("Admin registered successfully");
    }

    // =========================
    // ✅ COMMON LOGIN (ADMIN + USER)
    // =========================
    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        // 🔍 Check admin first
        var admin = _db.Admins.FirstOrDefault(x => x.Email == dto.Email);
        if (admin != null && BCrypt.Net.BCrypt.Verify(dto.Password, admin.Password))
        {
            var adminToken = GenerateToken(admin.AdminId, "admin");
            return Ok(new { token = adminToken, role = "admin" });
        }

        // 🔍 Check user
        var user = _db.Users.FirstOrDefault(x => x.Email == dto.Email);
        if (user == null)
            return NotFound("User not found");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            return Unauthorized("Invalid password");

        var userToken = GenerateToken(user.UserId, "user");
        return Ok(new { token = userToken, role = "user" });
    }

    // =========================
    // 🔐 JWT TOKEN CREATOR
    // =========================
    private string GenerateToken(int id, string role)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, id.ToString()),
            new Claim(ClaimTypes.Role, role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(6),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // =========================
    // ✅ FORGOT PASSWORD (SMTP EMAIL)
    // =========================
    [HttpPost("forgot-password")]
    public IActionResult ForgotPassword(ForgotPasswordDto dto)
    {
        if (string.IsNullOrEmpty(dto.Email))
            return BadRequest("Email is required.");

        var user = _db.Users.FirstOrDefault(x => x.Email == dto.Email);
        if (user == null)
            return NotFound("User not found");

        // Generate secure token
        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToBase64String(tokenBytes);

        // Save token and expiry in DB
        user.ResetToken = token;
        user.ResetTokenExpiry = DateTime.Now.AddHours(1);
        _db.SaveChanges();

        // Send email
        if (string.IsNullOrEmpty(user.Email))
            return BadRequest("User email is not set.");

        try
        {
            var smtpHost = _config["SMTP:Host"];
            var smtpPort = int.Parse(_config["SMTP:Port"] ?? "587");
            var smtpUser = _config["SMTP:Username"];
            var smtpPass = _config["SMTP:Password"];
            var frontendUrl = _config["FrontendUrl"];

            // Encode token for safe URL
            var resetLink = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(token)}";

            using (var client = new SmtpClient(smtpHost, smtpPort))
            {
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(smtpUser!, smtpPass!);

                using (var mail = new MailMessage())
                {
                    mail.From = new MailAddress(smtpUser!, "NutriFit");

                    if (!string.IsNullOrEmpty(user.Email))
                        mail.To.Add(user.Email);

                    mail.Subject = "Reset Your Password";
                    mail.Body = $"Hi {user.Name},\n\nClick this link to reset your password:\n{resetLink}\n\nThis link expires in 1 hour.";
                    client.Send(mail);
                }
            }

            return Ok("Reset password link sent to your email.");
        }
        catch
        {
            return StatusCode(500, "Failed to send email.");
        }
    }

    // =========================
    // ✅ RESET PASSWORD (SECURE)
    // =========================
    [HttpPost("reset-password")]
    public IActionResult ResetPassword(ResetPasswordDto dto)
    {
        if (dto.NewPassword != dto.ConfirmPassword)
            return BadRequest("New Password and Confirm Password do not match.");

        if (string.IsNullOrEmpty(dto.Token))
            return BadRequest("Invalid or missing reset token.");

        // Decode token to handle URL encoding
        var token = Uri.UnescapeDataString(dto.Token);

        var user = _db.Users.FirstOrDefault(u =>
            u.ResetToken == token && u.ResetTokenExpiry > DateTime.Now);

        if (user == null)
            return BadRequest("Invalid or expired token.");

        // Update password
        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

        // ✅ Security: clear token and expiry after reset
        user.ResetToken = null;
        user.ResetTokenExpiry = null;

        _db.SaveChanges();

        return Ok("Password reset successfully.");
    }
}
