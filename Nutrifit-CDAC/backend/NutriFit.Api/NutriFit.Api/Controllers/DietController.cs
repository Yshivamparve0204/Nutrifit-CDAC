using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/diet")]
public class DietController : ControllerBase
{
    private readonly AppDbContext _db;

    public DietController(AppDbContext db)
    {
        _db = db;
    }

    // ==========================================
    // ✅ GET DAILY DIET PLAN (FULLY DYNAMIC)
    // ==========================================
    [HttpGet("daily-plan")]
    public IActionResult GetDailyDietPlan()
    {
        int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ✅ ADMIN DELETE SAFETY CHECK
        var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
        if (validUser == null)
            return Unauthorized("User no longer exists. Please register again.");

        var profile = _db.UserProfiles.FirstOrDefault(x => x.UserId == userId);
        if (profile == null)
            return BadRequest("User profile not found");

        // ================================
        // ✅ BMI → WeightCategory (AUTO)
        // ================================
        string weightCategory;

        if (profile.Bmi < 18.5m)
            weightCategory = "underweight";
        else if (profile.Bmi < 25)
            weightCategory = "normal";
        else
            weightCategory = "overweight";

        // ================================
        // ✅ Normalize user values
        // ================================
        string goal = profile.Goal!.Trim().ToLower();
        string foodPref = profile.FoodPreference!.Trim().ToLower();

        // ================================
        // ✅ Get main health condition
        // ================================
        int conditionId = _db.UserHealthConditions
            .Where(x => x.UserId == userId)
            .Select(x => x.HealthConditionId)
            .FirstOrDefault();

        if (conditionId == 0)
            conditionId = 1; // None

        // ================================
        // ✅ EXACT MATCH (ALL PROFILE BASED)
        // ================================
        var plan = _db.DietPlans.FirstOrDefault(p =>
            p.Goal.ToLower() == goal &&
            p.WeightCategory.ToLower() == weightCategory &&
            p.FoodPreference.ToLower() == foodPref &&
            p.ConditionId == conditionId
        );

        // ================================
        // ✅ FALLBACK → None condition
        // ================================
        if (plan == null)
        {
            plan = _db.DietPlans.FirstOrDefault(p =>
                p.Goal.ToLower() == goal &&
                p.WeightCategory.ToLower() == weightCategory &&
                p.FoodPreference.ToLower() == foodPref &&
                p.ConditionId == 1
            );
        }

        if (plan == null)
            return Ok(new List<object>());

        // ================================
        // ✅ LOAD DAILY DIET (Morning → Night)
        // ================================
        var data =
            from d in _db.DietPlanFoods
            join f in _db.Foods on d.FoodId equals f.FoodId
            where d.DietId == plan.DietId
            orderby
                d.MealType == "breakfast" ? 1 :
                d.MealType == "snack" ? 2 :
                d.MealType == "lunch" ? 3 :
                d.MealType == "snack2" ? 4 : 5
            select new
            {
                d.MealType,
                f.FoodName,
                f.Calories,
                f.Protein,
                f.Carbs,
                f.Fat,
                f.GlycemicIndex,
                f.SodiumContent
            };

        return Ok(data.ToList());
    }

    // ==========================================
    // ✅ ADD MEAL LOG
    // ==========================================
    [HttpPost("log-meal")]
    public IActionResult LogMeal([FromBody] MealLog model)
    {
        int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ✅ ADMIN DELETE SAFETY CHECK
        var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
        if (validUser == null)
            return Unauthorized("User no longer exists. Please register again.");

        model.UserId = userId;
        model.Date = DateTime.Now;

        _db.MealLogs.Add(model);
        _db.SaveChanges();

        return Ok(new { message = "Meal logged successfully" });
    }

    // ==========================================
    // ✅ GET TODAY MEAL LOGS
    // ==========================================
    [HttpGet("today-logs")]
    public IActionResult GetTodayMeals()
    {
        int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ✅ ADMIN DELETE SAFETY CHECK
        var validUser = _db.Users.FirstOrDefault(x => x.UserId == userId);
        if (validUser == null)
            return Unauthorized("User no longer exists. Please register again.");

        DateTime today = DateTime.Today;

        var data =
            from m in _db.MealLogs
            join f in _db.Foods on m.FoodId equals f.FoodId
            where m.UserId == userId && m.Date.Date == today
            select new
            {
                m.MealType,
                m.Quantity,
                f.FoodName,
                f.Calories,
                f.Protein,
                f.Carbs,
                f.Fat
            };

        return Ok(data.ToList());
    }
}