using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/workout")]
public class WorkoutController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkoutController(AppDbContext db)
    {
        _db = db;
    }

    // ================================
    // ✅ GET WEEKLY WORKOUT PLAN (DYNAMIC)
    // ================================
    [HttpGet("weekly-plan")]
    public IActionResult GetWeeklyWorkoutPlan()
    {
        int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ✅ ADMIN DELETE SAFETY CHECK
        var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
        if (validUser == null)
            return Unauthorized("User no longer exists. Please register again.");

        var profile = _db.UserProfiles.FirstOrDefault(x => x.UserId == userId);
        if (profile == null)
            return BadRequest("User profile not found");

        int conditionId = _db.UserHealthConditions
            .Where(x => x.UserId == userId)
            .Select(x => x.HealthConditionId)
            .FirstOrDefault();

        if (conditionId == 0)
            conditionId = 1; // None

        // ================================
        // ✅ FIND PLAN
        // ================================
        var plan = _db.WorkoutPlans.FirstOrDefault(p =>
            p.Goal == profile.Goal &&
            p.WeightCategory == profile.WeightCategory &&
            p.ActivityLevel == profile.ActivityLevel &&
            p.HealthConditionId == conditionId
        );

        // fallback → None
        if (plan == null)
        {
            plan = _db.WorkoutPlans.FirstOrDefault(p =>
                p.Goal == profile.Goal &&
                p.WeightCategory == profile.WeightCategory &&
                p.ActivityLevel == profile.ActivityLevel &&
                p.HealthConditionId == 1
            );
        }

        if (plan == null)
            return Ok(new List<object>());

        // ================================
        // ✅ RETURN WEEKLY PLAN
        // ================================
        var data =
            from d in _db.WorkoutPlanDetails
            join w in _db.Workouts on d.WorkoutId equals w.WorkoutId
            where d.PlanId == plan.PlanId
            orderby
                d.DayName == "Monday" ? 1 :
                d.DayName == "Tuesday" ? 2 :
                d.DayName == "Wednesday" ? 3 :
                d.DayName == "Thursday" ? 4 :
                d.DayName == "Friday" ? 5 :
                d.DayName == "Saturday" ? 6 : 7
            select new
            {
                d.DayName,
                w.WorkoutName,
                w.WorkoutType,
                w.Intensity,
                d.DurationMinutes,
                w.HealthSafe
            };

        return Ok(data.ToList());
    }
}