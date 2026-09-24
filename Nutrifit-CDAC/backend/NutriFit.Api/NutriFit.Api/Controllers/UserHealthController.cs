using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/user/health")]
public class UserHealthController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserHealthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("all")]
    public IActionResult AllConditions()
    {
        return Ok(_db.HealthConditions.ToList());
    }

    [HttpGet]
    public IActionResult UserConditions()
    {
        int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ✅ ADMIN DELETE SAFETY CHECK
        var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
        if (validUser == null)
            return Unauthorized("User no longer exists. Please register again.");

        var data = _db.UserHealthConditions
            .Where(x => x.UserId == userId)
            .Select(x => x.HealthConditionId)
            .ToList();

        return Ok(data);
    }

    [HttpPost]
    public IActionResult Save(List<int> ids)
    {
        int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ✅ ADMIN DELETE SAFETY CHECK
        var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
        if (validUser == null)
            return Unauthorized("User no longer exists. Please register again.");

        var old = _db.UserHealthConditions.Where(x => x.UserId == userId);
        _db.UserHealthConditions.RemoveRange(old);

        foreach (var id in ids)
        {
            _db.UserHealthConditions.Add(new UserHealthCondition
            {
                UserId = userId,
                HealthConditionId = id
            });
        }

        _db.SaveChanges();
        return Ok("Health conditions saved");
    }
}