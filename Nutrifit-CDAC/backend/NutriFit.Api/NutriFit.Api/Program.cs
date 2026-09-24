using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// ======================
// ✅ DATABASE CONTEXT
// ======================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ======================
// ✅ CORS CONFIGURATION
// Allow React frontend to make DELETE/PUT/OPTIONS requests
// ======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        p => p.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()        // allow GET, POST, PUT, DELETE, OPTIONS
              .AllowCredentials());
});

// ======================
// ✅ JWT AUTHENTICATION
// ======================
var jwtKey = builder.Configuration["Jwt:Key"]
             ?? throw new Exception("JWT Key is missing in appsettings.json");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// ======================
// ✅ BUILD APP
// ======================
var app = builder.Build();

// ======================
// ✅ MIDDLEWARE
// ======================
app.UseHttpsRedirection();

// ✅ Apply CORS before authentication
app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

// ======================
// ✅ MAP CONTROLLERS
// ======================
app.MapControllers();

// ✅ TEST ENDPOINT
app.MapGet("/", () => "🚀 NutriFit API running on https://localhost:44329");

// ======================
// ✅ RUN APP
// ======================
app.Run();
